import { Response, NextFunction } from 'express';
import { prisma } from '../../database/client';
import { logger } from '../../utils/logger';
import { AuthRequest } from '../middleware/auth';

class SocialController {
  /**
   * Get home timeline
   * GET /api/v1/timelines/home
   */
  async getHomeTimeline(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { max_id, min_id, limit = 20 } = req.query;

      // Get posts from followed users and own posts
      const following = await prisma.follow.findMany({
        where: { followerId: userId, isApproved: true },
        select: { followingId: true },
      });

      const followingIds = following.map(f => f.followingId);
      const authorIds = [userId, ...followingIds];

      const posts = await prisma.post.findMany({
        where: {
          authorId: { in: authorIds },
          isDeleted: false,
          visibility: { in: ['public', 'unlisted'] },
          ...(max_id && { id: { lt: max_id as string } }),
          ...(min_id && { id: { gt: min_id as string } }),
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
              emailVerified: true,
            },
          },
          media: true,
          favourites: { where: { userId } },
          reblogs: { where: { userId } },
          bookmarks: { where: { userId } },
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit as string),
      });

      // Transform to GoToSocial format
      const statuses = posts.map(post => this.transformToGTSStatus(post, userId));

      res.json(statuses);
    } catch (error) {
      logger.error('Get home timeline error:', error);
      next(error);
    }
  }

  /**
   * Get public timeline
   * GET /api/v1/timelines/public
   */
  async getPublicTimeline(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { max_id, min_id, limit = 20, local } = req.query;

      const posts = await prisma.post.findMany({
        where: {
          isDeleted: false,
          visibility: 'public',
          ...(max_id && { id: { lt: max_id as string } }),
          ...(min_id && { id: { gt: min_id as string } }),
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
              emailVerified: true,
            },
          },
          media: true,
          favourites: userId ? { where: { userId } } : false,
          reblogs: userId ? { where: { userId } } : false,
          bookmarks: userId ? { where: { userId } } : false,
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit as string),
      });

      const statuses = posts.map(post => this.transformToGTSStatus(post, userId));

      res.json(statuses);
    } catch (error) {
      logger.error('Get public timeline error:', error);
      next(error);
    }
  }

  /**
   * Get a single status
   * GET /api/v1/statuses/:id
   */
  async getStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const post = await prisma.post.findUnique({
        where: { id },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
              emailVerified: true,
            },
          },
          media: true,
          favourites: userId ? { where: { userId } } : false,
          reblogs: userId ? { where: { userId } } : false,
          bookmarks: userId ? { where: { userId } } : false,
        },
      });

      if (!post || post.isDeleted) {
        return res.status(404).json({ error: 'Status not found' });
      }

      res.json(this.transformToGTSStatus(post, userId));
    } catch (error) {
      logger.error('Get status error:', error);
      next(error);
    }
  }

  /**
   * Create a new status
   * POST /api/v1/statuses
   */
  async createStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const {
        status,
        media_ids,
        in_reply_to_id,
        sensitive,
        spoiler_text,
        visibility = 'public',
        language,
      } = req.body;

      // Create post
      const post = await prisma.post.create({
        data: {
          authorId: userId,
          content: status || '',
          contentHtml: status || '',
          inReplyToId: in_reply_to_id,
          sensitive: sensitive || false,
          spoilerText: spoiler_text,
          visibility,
          language,
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
              emailVerified: true,
            },
          },
          media: true,
        },
      });

      // Update reply count
      if (in_reply_to_id) {
        await prisma.post.update({
          where: { id: in_reply_to_id },
          data: { repliesCount: { increment: 1 } },
        });
      }

      logger.info(`New post created by user: ${userId}`);

      res.status(201).json(this.transformToGTSStatus(post, userId));
    } catch (error) {
      logger.error('Create status error:', error);
      next(error);
    }
  }

  /**
   * Delete a status
   * DELETE /api/v1/statuses/:id
   */
  async deleteStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const post = await prisma.post.findUnique({
        where: { id },
      });

      if (!post) {
        return res.status(404).json({ error: 'Status not found' });
      }

      if (post.authorId !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      // Soft delete
      await prisma.post.update({
        where: { id },
        data: { isDeleted: true },
      });

      res.json({ message: 'Status deleted successfully' });
    } catch (error) {
      logger.error('Delete status error:', error);
      next(error);
    }
  }

  /**
   * Favourite a status
   * POST /api/v1/statuses/:id/favourite
   */
  async favouriteStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Create favourite
      await prisma.favourite.upsert({
        where: {
          userId_postId: { userId, postId: id },
        },
        update: {},
        create: {
          userId,
          postId: id,
        },
      });

      // Update count
      await prisma.post.update({
        where: { id },
        data: { favouritesCount: { increment: 1 } },
      });

      const post = await prisma.post.findUnique({
        where: { id },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
              emailVerified: true,
            },
          },
          media: true,
          favourites: { where: { userId } },
          reblogs: { where: { userId } },
          bookmarks: { where: { userId } },
        },
      });

      res.json(this.transformToGTSStatus(post!, userId));
    } catch (error) {
      logger.error('Favourite status error:', error);
      next(error);
    }
  }

  /**
   * Unfavourite a status
   * POST /api/v1/statuses/:id/unfavourite
   */
  async unfavouriteStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      await prisma.favourite.deleteMany({
        where: { userId, postId: id },
      });

      await prisma.post.update({
        where: { id },
        data: { favouritesCount: { decrement: 1 } },
      });

      const post = await prisma.post.findUnique({
        where: { id },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
              emailVerified: true,
            },
          },
          media: true,
          favourites: { where: { userId } },
          reblogs: { where: { userId } },
          bookmarks: { where: { userId } },
        },
      });

      res.json(this.transformToGTSStatus(post!, userId));
    } catch (error) {
      logger.error('Unfavourite status error:', error);
      next(error);
    }
  }

  /**
   * Get account info
   * GET /api/v1/accounts/:id
   */
  async getAccount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          username: true,
          displayName: true,
          bio: true,
          avatar: true,
          coverImage: true,
          createdAt: true,
          emailVerified: true,
          _count: {
            select: {
              followers: true,
              following: true,
              posts: { where: { isDeleted: false } },
            },
          },
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'Account not found' });
      }

      // Transform to GoToSocial account format
      const account = {
        id: user.id,
        username: user.username,
        acct: user.username,
        display_name: user.displayName || user.username,
        locked: false,
        bot: false,
        discoverable: true,
        group: false,
        created_at: user.createdAt.toISOString(),
        note: user.bio || '',
        url: `/@${user.username}`,
        avatar: user.avatar || '',
        avatar_static: user.avatar || '',
        header: user.coverImage || '',
        header_static: user.coverImage || '',
        followers_count: user._count.followers,
        following_count: user._count.following,
        statuses_count: user._count.posts,
        last_status_at: null,
        emojis: [],
        fields: [],
        verified: user.emailVerified,
      };

      res.json(account);
    } catch (error) {
      logger.error('Get account error:', error);
      next(error);
    }
  }

  /**
   * Get current user's account
   * GET /api/v1/accounts/verify_credentials
   */
  async verifyCredentials(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          displayName: true,
          bio: true,
          avatar: true,
          coverImage: true,
          createdAt: true,
          emailVerified: true,
          _count: {
            select: {
              followers: true,
              following: true,
              posts: { where: { isDeleted: false } },
            },
          },
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'Account not found' });
      }

      const account = {
        id: user.id,
        username: user.username,
        acct: user.username,
        display_name: user.displayName || user.username,
        locked: false,
        bot: false,
        discoverable: true,
        group: false,
        created_at: user.createdAt.toISOString(),
        note: user.bio || '',
        url: `/@${user.username}`,
        avatar: user.avatar || '',
        avatar_static: user.avatar || '',
        header: user.coverImage || '',
        header_static: user.coverImage || '',
        followers_count: user._count.followers,
        following_count: user._count.following,
        statuses_count: user._count.posts,
        last_status_at: null,
        emojis: [],
        fields: [],
        verified: user.emailVerified,
      };

      res.json(account);
    } catch (error) {
      logger.error('Verify credentials error:', error);
      next(error);
    }
  }

  /**
   * Transform internal post to GoToSocial status format
   */
  private transformToGTSStatus(post: any, currentUserId?: string) {
    return {
      id: post.id,
      created_at: post.createdAt.toISOString(),
      in_reply_to_id: post.inReplyToId,
      in_reply_to_account_id: null,
      sensitive: post.sensitive,
      spoiler_text: post.spoilerText || '',
      visibility: post.visibility,
      language: post.language,
      uri: `https://tyriantrade.com/posts/${post.id}`,
      url: `https://tyriantrade.com/posts/${post.id}`,
      replies_count: post.repliesCount,
      reblogs_count: post.reblogsCount,
      favourites_count: post.favouritesCount,
      edited_at: post.editedAt?.toISOString() || null,
      content: post.contentHtml || post.content,
      reblog: null,
      account: {
        id: post.author.id,
        username: post.author.username,
        acct: post.author.username,
        display_name: post.author.displayName || post.author.username,
        locked: false,
        bot: false,
        discoverable: true,
        group: false,
        created_at: new Date().toISOString(),
        note: '',
        url: `/@${post.author.username}`,
        avatar: post.author.avatar || '',
        avatar_static: post.author.avatar || '',
        header: '',
        header_static: '',
        followers_count: 0,
        following_count: 0,
        statuses_count: 0,
        last_status_at: null,
        emojis: [],
        fields: [],
        verified: post.author.emailVerified,
      },
      media_attachments: post.media?.map((m: any) => ({
        id: m.id,
        type: m.type,
        url: m.url,
        preview_url: m.previewUrl || m.url,
        remote_url: m.remoteUrl,
        meta: m.meta || {},
        description: m.description,
        blurhash: m.blurhash,
      })) || [],
      mentions: [],
      tags: post.tags?.map((tag: string) => ({ name: tag, url: `#${tag}` })) || [],
      emojis: [],
      card: null,
      poll: null,
      custom_metadata: post.customMetadata,
      favourited: post.favourites?.length > 0,
      reblogged: post.reblogs?.length > 0,
      bookmarked: post.bookmarks?.length > 0,
    };
  }
}

export const socialController = new SocialController();
