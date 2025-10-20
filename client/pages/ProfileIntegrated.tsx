import { FC, useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSearchParams } from "react-router-dom";
import UserHeader from "@/components/UserHeader/UserHeader";
import EditProfileModal from "@/components/socialProfile/EditProfileModal";
import NotificationsSettings from "@/components/NotificationsSettings/NotificationsSettings";
import BillingSettings from "@/components/BillingSettings/BillingSettings";
import ReferralsSettings from "@/components/ReferralsSettings/ReferralsSettings";
import KycSettings from "@/components/KycSettings/KycSettings";
import SecuritySettings from "@/components/SecuritySettings/SecuritySettings";
import ProfileOverview from "@/components/ProfileOverview/ProfileOverview";
import SocialOverview from "@/components/SocialOverview/SocialOverview";
import { cn } from "@/lib/utils";
import { 
  getCurrentUserProfile, 
  updateUserProfile, 
  uploadAvatar,
  uploadCoverImage,
  ProfileUpdateData
} from "@/lib/supabase-profile";
import type { SocialProfileData } from "@/data/socialProfile";
import Dashboard from "./Dashboard";

type MainTab = "dashboard" | "profile" | "social";

type ProfileSubTab =
  | "overview"
  | "security"
  | "notifications"
  | "billing"
  | "referrals"
  | "kyc";

type SocialSubTab = "overview" | "my-posts" | "monetization";

const mainTabs = [
  {
    id: "dashboard" as MainTab,
    label: "Dashboard",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M8.75 7.29167V5.625C8.75 4.25522 8.75 3.57032 8.37167 3.10934C8.30242 3.02496 8.22504 2.94757 8.14066 2.87832C7.67968 2.5 6.99478 2.5 5.625 2.5C4.25522 2.5 3.57032 2.5 3.10934 2.87832C3.02496 2.94757 2.94757 3.02496 2.87832 3.10934C2.5 3.57032 2.5 4.25522 2.5 5.625V7.29167C2.5 8.66142 2.5 9.34633 2.87832 9.80733C2.94757 9.89175 3.02496 9.96908 3.10934 10.0383C3.57032 10.4167 4.25522 10.4167 5.625 10.4167C6.99478 10.4167 7.67968 10.4167 8.14066 10.0383C8.22504 9.96908 8.30242 9.89175 8.37167 9.80733C8.75 9.34633 8.75 8.66142 8.75 7.29167Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M6.45833 12.917H4.79167C4.21018 12.917 3.91944 12.917 3.68286 12.9887C3.15019 13.1503 2.73335 13.5672 2.57177 14.0998C2.5 14.3364 2.5 14.6272 2.5 15.2087C2.5 15.7902 2.5 16.0809 2.57177 16.3175C2.73335 16.8502 3.15019 17.267 3.68286 17.4286C3.91944 17.5003 4.21018 17.5003 4.79167 17.5003H6.45833C7.03982 17.5003 7.33056 17.5003 7.56714 17.4286C8.09981 17.267 8.51667 16.8502 8.67825 16.3175C8.75 16.0809 8.75 15.7902 8.75 15.2087C8.75 14.6272 8.75 14.3364 8.67825 14.0998C8.51667 13.5672 8.09981 13.1503 7.56714 12.9887C7.33056 12.917 7.03982 12.917 6.45833 12.917Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M17.5 14.3747V12.708C17.5 11.3383 17.5 10.6533 17.1217 10.1923C17.0524 10.1079 16.9751 10.0306 16.8907 9.96134C16.4297 9.58301 15.7447 9.58301 14.375 9.58301C13.0052 9.58301 12.3203 9.58301 11.8593 9.96134C11.7749 10.0306 11.6976 10.1079 11.6283 10.1923C11.25 10.6533 11.25 11.3383 11.25 12.708V14.3747C11.25 15.7444 11.25 16.4293 11.6283 16.8903C11.6976 16.9748 11.7749 17.0521 11.8593 17.1213C12.3203 17.4997 13.0052 17.4997 14.375 17.4997C15.7447 17.4997 16.4297 17.4997 16.8907 17.1213C16.9751 17.0521 17.0524 16.9748 17.1217 16.8903C17.5 16.4293 17.5 15.7444 17.5 14.3747Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M15.2083 2.5H13.5417C12.9602 2.5 12.6694 2.5 12.4328 2.57177C11.9002 2.73335 11.4833 3.15019 11.3217 3.68286C11.25 3.91944 11.25 4.21018 11.25 4.79167C11.25 5.37315 11.25 5.66389 11.3217 5.90048C11.4833 6.43314 11.9002 6.84998 12.4328 7.01157C12.6694 7.08333 12.9602 7.08333 13.5417 7.08333H15.2083C15.7898 7.08333 16.0806 7.08333 16.3172 7.01157C16.8498 6.84998 17.2667 6.43314 17.4283 5.90048C17.5 5.66389 17.5 5.37315 17.5 4.79167C17.5 4.21018 17.5 3.91944 17.4283 3.68286C17.2667 3.15019 16.8498 2.73335 16.3172 2.57177C16.0806 2.5 15.7898 2.5 15.2083 2.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "profile" as MainTab,
    label: "Profile",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M5.48131 12.9017C4.30234 13.6037 1.21114 15.0371 3.09389 16.8308C4.01359 17.707 5.03791 18.3337 6.32573 18.3337H13.6743C14.9621 18.3337 15.9864 17.707 16.9061 16.8308C18.7888 15.0371 15.6977 13.6037 14.5187 12.9017C11.754 11.2554 8.24599 11.2554 5.48131 12.9017Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M13.75 5.41699C13.75 7.48806 12.0711 9.16699 10 9.16699C7.92893 9.16699 6.25 7.48806 6.25 5.41699C6.25 3.34593 7.92893 1.66699 10 1.66699C12.0711 1.66699 13.75 3.34593 13.75 5.41699Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
  {
    id: "social" as MainTab,
    label: "Social Network",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <g clipPath="url(#clip0_31_563)">
          <path
            d="M16.666 7.50033C16.0033 4.17912 12.9267 1.66699 9.2321 1.66699C5.05392 1.66699 1.66602 4.87967 1.66602 8.84199C1.66602 10.7458 2.44784 12.4757 3.72314 13.7593C4.00392 14.042 4.19139 14.4282 4.11573 14.8256C3.99087 15.4754 3.7079 16.0816 3.29356 16.5867C4.38371 16.7877 5.51724 16.6067 6.48936 16.0942C6.83301 15.9132 7.00482 15.8226 7.12607 15.8042C7.21095 15.7913 7.32151 15.8033 7.49935 15.8338"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9.16602 13.5517C9.16602 15.9732 11.2183 17.9365 13.7493 17.9365C14.0469 17.9368 14.3437 17.9093 14.636 17.8545C14.8464 17.8149 14.9517 17.7952 15.0251 17.8064C15.0985 17.8176 15.2027 17.873 15.4108 17.9837C15.9997 18.2968 16.6863 18.4074 17.3468 18.2846C17.0958 17.9759 16.9243 17.6055 16.8487 17.2083C16.8028 16.9655 16.9164 16.7295 17.0865 16.5567C17.8591 15.7722 18.3327 14.7152 18.3327 13.5517C18.3327 11.1303 16.2803 9.16699 13.7493 9.16699C11.2183 9.16699 9.16602 11.1303 9.16602 13.5517Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </g>
        <defs>
          <clipPath id="clip0_31_563">
            <rect width="20" height="20" fill="white" />
          </clipPath>
        </defs>
      </svg>
    ),
  },
];

const profileSubTabs = [
  {
    id: "overview" as ProfileSubTab,
    label: "Overview",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M8.75 7.29167V5.625C8.75 4.25522 8.75 3.57032 8.37167 3.10934C8.30242 3.02496 8.22504 2.94757 8.14066 2.87832C7.67968 2.5 6.99478 2.5 5.625 2.5C4.25522 2.5 3.57032 2.5 3.10934 2.87832C3.02496 2.94757 2.94757 3.02496 2.87832 3.10934C2.5 3.57032 2.5 4.25522 2.5 5.625V7.29167C2.5 8.66142 2.5 9.34633 2.87832 9.80733C2.94757 9.89175 3.02496 9.96908 3.10934 10.0383C3.57032 10.4167 4.25522 10.4167 5.625 10.4167C6.99478 10.4167 7.67968 10.4167 8.14066 10.0383C8.22504 9.96908 8.30242 9.89175 8.37167 9.80733C8.75 9.34633 8.75 8.66142 8.75 7.29167Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M6.45833 12.917H4.79167C4.21018 12.917 3.91944 12.917 3.68286 12.9887C3.15019 13.1503 2.73335 13.5672 2.57177 14.0998C2.5 14.3364 2.5 14.6272 2.5 15.2087C2.5 15.7902 2.5 16.0809 2.57177 16.3175C2.73335 16.8502 3.15019 17.267 3.68286 17.4286C3.91944 17.5003 4.21018 17.5003 4.79167 17.5003H6.45833C7.03982 17.5003 7.33056 17.5003 7.56714 17.4286C8.09981 17.267 8.51667 16.8502 8.67825 16.3175C8.75 16.0809 8.75 15.7902 8.75 15.2087C8.75 14.6272 8.75 14.3364 8.67825 14.0998C8.51667 13.5672 8.09981 13.1503 7.56714 12.9887C7.33056 12.917 7.03982 12.917 6.45833 12.917Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M17.5 14.3747V12.708C17.5 11.3383 17.5 10.6533 17.1217 10.1923C17.0524 10.1079 16.9751 10.0306 16.8907 9.96134C16.4297 9.58301 15.7447 9.58301 14.375 9.58301C13.0052 9.58301 12.3203 9.58301 11.8593 9.96134C11.7749 10.0306 11.6976 10.1079 11.6283 10.1923C11.25 10.6533 11.25 11.3383 11.25 12.708V14.3747C11.25 15.7444 11.25 16.4293 11.6283 16.8903C11.6976 16.9748 11.7749 17.0521 11.8593 17.1213C12.3203 17.4997 13.0052 17.4997 14.375 17.4997C15.7447 17.4997 16.4297 17.4997 16.8907 17.1213C16.9751 17.0521 17.0524 16.9748 17.1217 16.8903C17.5 16.4293 17.5 15.7444 17.5 14.3747Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M15.2083 2.5H13.5417C12.9602 2.5 12.6694 2.5 12.4328 2.57177C11.9002 2.73335 11.4833 3.15019 11.3217 3.68286C11.25 3.91944 11.25 4.21018 11.25 4.79167C11.25 5.37315 11.25 5.66389 11.3217 5.90048C11.4833 6.43314 11.9002 6.84998 12.4328 7.01157C12.6694 7.08333 12.9602 7.08333 13.5417 7.08333H15.2083C15.7898 7.08333 16.0806 7.08333 16.3172 7.01157C16.8498 6.84998 17.2667 6.43314 17.4283 5.90048C17.5 5.66389 17.5 5.37315 17.5 4.79167C17.5 4.21018 17.5 3.91944 17.4283 3.68286C17.2667 3.15019 16.8498 2.73335 16.3172 2.57177C16.0806 2.5 15.7898 2.5 15.2083 2.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "security" as ProfileSubTab,
    label: "Security",
    icon: (
      <svg width="20" height="20" viewBox="0 0 21 20" fill="none">
        <path
          d="M16.0907 2.91311C14.5137 2.12851 12.5841 1.66699 10.5 1.66699C8.41592 1.66699 6.48625 2.12851 4.9093 2.91311C4.13598 3.29788 3.74932 3.49026 3.37467 4.09514C3 4.70003 3 5.28573 3 6.45711V9.36458C3 14.1007 6.7853 16.734 8.9775 17.8618C9.58892 18.1764 9.89458 18.3337 10.5 18.3337C11.1054 18.3337 11.4111 18.1764 12.0224 17.8618C14.2147 16.734 18 14.1007 18 9.36458V6.45711C18 5.28573 18 4.70004 17.6253 4.09514C17.2507 3.49025 16.864 3.29788 16.0907 2.91311Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8 9.58366C8 9.58366 9.17325 9.79358 9.66667 11.2503C9.66667 11.2503 10.9167 8.75033 13 7.91699"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "notifications" as ProfileSubTab,
    label: "Notifications",
    icon: (
      <svg width="20" height="20" viewBox="0 0 21 20" fill="none">
        <path
          d="M2.60794 12.3083C2.43073 13.47 3.22301 14.2763 4.19305 14.6782C7.91202 16.2188 13.0873 16.2188 16.8063 14.6782C17.7763 14.2763 18.5686 13.47 18.3914 12.3083C18.2825 11.5944 17.744 10.9999 17.345 10.4194C16.8224 9.64974 16.7705 8.81016 16.7704 7.91699C16.7704 4.46521 13.9629 1.66699 10.4997 1.66699C7.03645 1.66699 4.22895 4.46521 4.22895 7.91699C4.22887 8.81016 4.17694 9.64974 3.65435 10.4194C3.25538 10.9999 2.71685 11.5944 2.60794 12.3083Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7.16699 15.833C7.54907 17.2707 8.89658 18.333 10.5003 18.333C12.1041 18.333 13.4516 17.2707 13.8337 15.833"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "billing" as ProfileSubTab,
    label: "Billing",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M1.66699 9.99967C1.66699 7.05177 1.66699 5.57782 2.54433 4.59376C2.68465 4.43637 2.83931 4.2908 3.00654 4.15873C4.0521 3.33301 5.61818 3.33301 8.75033 3.33301H11.2503C14.3825 3.33301 15.9486 3.33301 16.9941 4.15873C17.1613 4.2908 17.316 4.43637 17.4563 4.59376C18.3337 5.57782 18.3337 7.05177 18.3337 9.99967C18.3337 12.9476 18.3337 14.4215 17.4563 15.4056C17.316 15.563 17.1613 15.7085 16.9941 15.8406C15.9486 16.6663 14.3825 16.6663 11.2503 16.6663H8.75033C5.61818 16.6663 4.0521 16.6663 3.00654 15.8406C2.83931 15.7085 2.68465 15.563 2.54433 15.4056C1.66699 14.4215 1.66699 12.9476 1.66699 9.99967Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8.33301 13.333H9.58301"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12.083 13.333H14.9997"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M1.66699 7.5H18.3337"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "referrals" as ProfileSubTab,
    label: "Referrals",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M12.9163 9.16667C12.9163 7.55583 11.6105 6.25 9.99967 6.25C8.38884 6.25 7.08301 7.55583 7.08301 9.16667C7.08301 10.7775 8.38884 12.0833 9.99967 12.0833C11.6105 12.0833 12.9163 10.7775 12.9163 9.16667Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12.9022 9.45825C13.1705 9.53958 13.4551 9.58333 13.7499 9.58333C15.3607 9.58333 16.6666 8.2775 16.6666 6.66667C16.6666 5.05583 15.3607 3.75 13.7499 3.75C12.2375 3.75 10.9939 4.90117 10.8477 6.37511"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9.15192 6.37511C9.00567 4.90117 7.76211 3.75 6.24967 3.75C4.63884 3.75 3.33301 5.05583 3.33301 6.66667C3.33301 8.2775 4.63884 9.58333 6.24967 9.58333C6.54452 9.58333 6.82913 9.53958 7.0974 9.45825"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M18.3333 13.7497C18.3333 11.4485 16.2813 9.58301 13.75 9.58301"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14.5837 16.2497C14.5837 13.9485 12.5317 12.083 10.0003 12.083C7.46902 12.083 5.41699 13.9485 5.41699 16.2497"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6.25033 9.58301C3.71902 9.58301 1.66699 11.4485 1.66699 13.7497"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "kyc" as ProfileSubTab,
    label: "KYC",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M1.66699 10C1.66699 6.46447 1.66699 4.6967 2.88738 3.59835C4.10777 2.5 6.07196 2.5 10.0003 2.5C13.9287 2.5 15.8929 2.5 17.1132 3.59835C18.3337 4.6967 18.3337 6.46447 18.3337 10C18.3337 13.5355 18.3337 15.3033 17.1132 16.4017C15.8929 17.5 13.9287 17.5 10.0003 17.5C6.07196 17.5 4.10777 17.5 2.88738 16.4017C1.66699 15.3033 1.66699 13.5355 1.66699 10Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4.16699 13.75C5.17392 11.5991 8.92716 11.4576 10.0003 13.75M8.75033 7.91667C8.75033 8.83717 8.00413 9.58333 7.08366 9.58333C6.16318 9.58333 5.41699 8.83717 5.41699 7.91667C5.41699 6.99619 6.16318 6.25 7.08366 6.25C8.00413 6.25 8.75033 6.99619 8.75033 7.91667Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M12.5 8.33301H15.8333"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12.5 11.667H15.8333"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

const socialSubTabs = [
  {
    id: "overview" as SocialSubTab,
    label: "Overview",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M8.75 7.29167V5.625C8.75 4.25522 8.75 3.57032 8.37167 3.10934C8.30242 3.02496 8.22504 2.94757 8.14066 2.87832C7.67968 2.5 6.99478 2.5 5.625 2.5C4.25522 2.5 3.57032 2.5 3.10934 2.87832C3.02496 2.94757 2.94757 3.02496 2.87832 3.10934C2.5 3.57032 2.5 4.25522 2.5 5.625V7.29167C2.5 8.66142 2.5 9.34633 2.87832 9.80733C2.94757 9.89175 3.02496 9.96908 3.10934 10.0383C3.57032 10.4167 4.25522 10.4167 5.625 10.4167C6.99478 10.4167 7.67968 10.4167 8.14066 10.0383C8.22504 9.96908 8.30242 9.89175 8.37167 9.80733C8.75 9.34633 8.75 8.66142 8.75 7.29167Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M6.45833 12.917H4.79167C4.21018 12.917 3.91944 12.917 3.68286 12.9887C3.15019 13.1503 2.73335 13.5672 2.57177 14.0998C2.5 14.3364 2.5 14.6272 2.5 15.2087C2.5 15.7902 2.5 16.0809 2.57177 16.3175C2.73335 16.8502 3.15019 17.267 3.68286 17.4286C3.91944 17.5003 4.21018 17.5003 4.79167 17.5003H6.45833C7.03982 17.5003 7.33056 17.5003 7.56714 17.4286C8.09981 17.267 8.51667 16.8502 8.67825 16.3175C8.75 16.0809 8.75 15.7902 8.75 15.2087C8.75 14.6272 8.75 14.3364 8.67825 14.0998C8.51667 13.5672 8.09981 13.1503 7.56714 12.9887C7.33056 12.917 7.03982 12.917 6.45833 12.917Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M17.5 14.3747V12.708C17.5 11.3383 17.5 10.6533 17.1217 10.1923C17.0524 10.1079 16.9751 10.0306 16.8907 9.96134C16.4297 9.58301 15.7447 9.58301 14.375 9.58301C13.0052 9.58301 12.3203 9.58301 11.8593 9.96134C11.7749 10.0306 11.6976 10.1079 11.6283 10.1923C11.25 10.6533 11.25 11.3383 11.25 12.708V14.3747C11.25 15.7444 11.25 16.4293 11.6283 16.8903C11.6976 16.9748 11.7749 17.0521 11.8593 17.1213C12.3203 17.4997 13.0052 17.4997 14.375 17.4997C15.7447 17.4997 16.4297 17.4997 16.8907 17.1213C16.9751 17.0521 17.0524 16.9748 17.1217 16.8903C17.5 16.4293 17.5 15.7444 17.5 14.3747Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M15.2083 2.5H13.5417C12.9602 2.5 12.6694 2.5 12.4328 2.57177C11.9002 2.73335 11.4833 3.15019 11.3217 3.68286C11.25 3.91944 11.25 4.21018 11.25 4.79167C11.25 5.37315 11.25 5.66389 11.3217 5.90048C11.4833 6.43314 11.9002 6.84998 12.4328 7.01157C12.6694 7.08333 12.9602 7.08333 13.5417 7.08333H15.2083C15.7898 7.08333 16.0806 7.08333 16.3172 7.01157C16.8498 6.84998 17.2667 6.43314 17.4283 5.90048C17.5 5.66389 17.5 5.37315 17.5 4.79167C17.5 4.21018 17.5 3.91944 17.4283 3.68286C17.2667 3.15019 16.8498 2.73335 16.3172 2.57177C16.0806 2.5 15.7898 2.5 15.2083 2.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "my-posts" as SocialSubTab,
    label: "My Posts",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M16.4576 9.16699V8.33366C16.4576 5.19096 16.4577 3.61962 15.4813 2.6433C14.505 1.66699 12.9337 1.66699 9.79098 1.66699H8.95773C5.81504 1.66699 4.2437 1.66699 3.26739 2.64329C2.29108 3.61959 2.29107 5.19093 2.29104 8.3336L2.29102 11.667C2.29098 14.8097 2.29097 16.381 3.26725 17.3573C4.24356 18.3336 5.81496 18.3337 8.95765 18.3337"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6.04102 5.83301H12.7076M6.04102 9.99967H12.7076"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M11.041 17.356V18.3337H12.0188C12.36 18.3337 12.5306 18.3337 12.6839 18.2702C12.8373 18.2066 12.9579 18.086 13.1992 17.8448L17.2188 13.8248C17.4463 13.5973 17.5601 13.4836 17.6209 13.3609C17.7367 13.1274 17.7367 12.8533 17.6209 12.6198C17.5601 12.4971 17.4463 12.3833 17.2188 12.1558C16.9913 11.9283 16.8775 11.8146 16.7548 11.7537C16.5213 11.6381 16.2471 11.6381 16.0136 11.7537C15.8909 11.8146 15.7771 11.9283 15.5496 12.1558L11.5299 16.1758C11.2887 16.417 11.1681 16.5376 11.1046 16.6909C11.041 16.8443 11.041 17.0148 11.041 17.356Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "monetization" as SocialSubTab,
    label: "Monetization",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M2.5 3.33301V11.6663C2.5 14.0233 2.5 15.2018 3.23223 15.9341C3.96447 16.6663 5.14297 16.6663 7.5 16.6663H17.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5 11.6663L7.70833 8.95801C8.24504 8.42126 8.51342 8.15294 8.82725 8.06439C9.04925 8.00179 9.28408 8.00179 9.50608 8.06439C9.81992 8.15294 10.0883 8.42126 10.625 8.95801C11.1618 9.49476 11.4301 9.76309 11.7439 9.85159C11.9659 9.91426 12.2008 9.91426 12.4228 9.85159C12.7366 9.76309 13.0049 9.49476 13.5417 8.95801L16.6667 5.83301"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

const ProfileIntegrated: FC = () => {
  const { user, isAuthenticated, updateUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Handle both old and new URL formats
  const getTabsFromUrl = () => {
    const tab = searchParams.get('tab');
    const subtab = searchParams.get('subtab');

    // Check if tab is actually a main tab
    const isMainTab = ['dashboard', 'profile', 'social'].includes(tab || '');

    if (isMainTab) {
      return {
        mainTab: (tab as MainTab) || "profile",
        subTab: (subtab as ProfileSubTab) || "overview"
      };
    } else {
      // Default to profile main tab
      return {
        mainTab: "profile" as MainTab,
        subTab: "overview" as ProfileSubTab
      };
    }
  };

  const initialTabs = getTabsFromUrl();
  const [activeMainTab, setActiveMainTab] = useState<MainTab>(initialTabs.mainTab);
  const [activeSubTab, setActiveSubTab] = useState<ProfileSubTab>(initialTabs.subTab);
  const [activeSocialSubTab, setActiveSocialSubTab] = useState<SocialSubTab>("overview");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Update tabs when URL changes
  useEffect(() => {
    const tabs = getTabsFromUrl();
    setActiveMainTab(tabs.mainTab);
    setActiveSubTab(tabs.subTab);
  }, [searchParams]);

  // Load user profile from Supabase
  useEffect(() => {
    async function loadProfile() {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      const profile = await getCurrentUserProfile(user.id);
      if (profile) {
        setProfileData(profile);
      }
      setLoading(false);
    }

    loadProfile();
  }, [user]);

  const handleSaveProfile = async (updatedProfile: Partial<SocialProfileData>) => {
    if (!user?.id) return;

    try {
      const updateData: ProfileUpdateData = {};

      // Map SocialProfileData to ProfileUpdateData
      if (updatedProfile.name) {
        const [firstName, ...lastNameParts] = updatedProfile.name.split(' ');
        updateData.first_name = firstName;
        updateData.last_name = lastNameParts.join(' ');
      }

      if (updatedProfile.bio) updateData.bio = updatedProfile.bio;
      if (updatedProfile.location) updateData.location = updatedProfile.location;
      if (updatedProfile.website?.url) updateData.website = updatedProfile.website.url;

      const updated = await updateUserProfile(user.id, updateData);
      if (updated) {
        setProfileData(updated);
        // Update user in AuthContext
        updateUser({
          username: updated.username,
          email: updated.email,
        });
        console.log('[ProfileIntegrated] Profile updated successfully');
      }
    } catch (error) {
      console.error('[ProfileIntegrated] Failed to save profile:', error);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    if (!user?.id) return;

    try {
      const avatarUrl = await uploadAvatar(user.id, file);
      if (avatarUrl) {
        const updated = await updateUserProfile(user.id, { avatar_url: avatarUrl });
        if (updated) {
          setProfileData(updated);
          console.log('[ProfileIntegrated] Avatar updated successfully');
        }
      }
    } catch (error) {
      console.error('[ProfileIntegrated] Failed to upload avatar:', error);
    }
  };

  const handleCoverUpload = async (file: File) => {
    if (!user?.id) return;

    try {
      const coverUrl = await uploadCoverImage(user.id, file);
      if (coverUrl) {
        const updated = await updateUserProfile(user.id, { cover: coverUrl });
        if (updated) {
          setProfileData(updated);
          console.log('[ProfileIntegrated] Cover updated successfully');
        }
      }
    } catch (error) {
      console.error('[ProfileIntegrated] Failed to upload cover:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex w-full items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Загрузка про��иля...</div>
      </div>
    );
  }

  if (!isAuthenticated || !profileData) {
    return (
      <div className="flex w-full items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Please login to view your profile</div>
      </div>
    );
  }

  // Transform Supabase data to SocialProfileData format for EditProfileModal
  const socialProfileData: SocialProfileData = {
    id: profileData.id,
    name: `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() || profileData.username,
    username: profileData.username,
    bio: profileData.bio || '',
    location: profileData.location || '',
    website: profileData.website ? { label: profileData.website, url: profileData.website } : undefined,
    joined: new Date(profileData.created_at).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long' }),
    avatar: profileData.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileData.username}`,
    cover: profileData.cover || '',
    stats: {
      tweets: profileData.posts_count || 0,
      following: profileData.following_count || 0,
      followers: profileData.followers_count || 0,
      likes: 0,
    },
    isVerified: profileData.verified,
    isPremium: profileData.premium,
  };

  return (
    <div className="flex flex-col gap-6">
      {/* User Header */}
      <div className="flex justify-center">
        <div className="w-full max-w-[720px]">
          <UserHeader
            isOwn={true}
            onEditProfile={() => setIsEditModalOpen(true)}
            profileData={{
              name: `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() || profileData.username,
              username: profileData.username,
              bio: profileData.bio || '',
              location: profileData.location || '',
              website: profileData.website || '',
              joined: profileData.joined_date
                ? new Date(profileData.joined_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
                : new Date(profileData.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
              avatar: profileData.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileData.username}`,
              cover: profileData.cover || '',
              stats: {
                tweets: profileData.posts_count || 0,
                following: profileData.following_count || 0,
                followers: profileData.followers_count || 0,
              },
              isVerified: profileData.verified || false,
              isPremium: profileData.premium || false,
              tradingStyle: profileData.trading_style,
            }}
            onAvatarUpload={handleAvatarUpload}
            onCoverUpload={handleCoverUpload}
          />
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex flex-col items-center gap-4">
        <div className="inline-flex flex-wrap items-center gap-3 p-1 rounded-[36px] border border-[#181B22] bg-black backdrop-blur-[50px]">
          {mainTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveMainTab(tab.id);
                setSearchParams({ tab: tab.id });
              }}
              className={cn(
                "flex items-center justify-center gap-2 px-4 py-3 rounded-[32px] transition-all whitespace-nowrap",
                activeMainTab === tab.id
                  ? "bg-gradient-to-l from-[#A06AFF] to-[#482090] backdrop-blur-[58.33px]"
                  : "border border-[#181B22] bg-black backdrop-blur-[58.33px]",
              )}
            >
              <span
                className={cn(
                  "w-5 h-5 flex items-center justify-center",
                  activeMainTab === tab.id ? "text-white" : "text-[#B0B0B0]"
                )}
              >
                {tab.icon}
              </span>
              <span
                className={cn(
                  "text-[15px] font-bold leading-normal",
                  activeMainTab === tab.id ? "text-white" : "text-[#B0B0B0]"
                )}
                style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
              >
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        {/* Profile Sub-tabs (shown only when Profile main tab is active) */}
        {activeMainTab === "profile" && (
          <div className="inline-flex flex-wrap items-center gap-3 p-1 rounded-[36px] border border-[#181B22] bg-black backdrop-blur-[50px]">
            {profileSubTabs.map((subTab) => (
              <button
                key={subTab.id}
                onClick={() => {
                  setActiveSubTab(subTab.id);
                  setSearchParams({ tab: activeMainTab, subtab: subTab.id });
                }}
                className={cn(
                  "flex items-center justify-center gap-2 px-4 py-3 rounded-[32px] transition-all whitespace-nowrap",
                  activeSubTab === subTab.id
                    ? "bg-gradient-to-l from-[#A06AFF] to-[#482090] backdrop-blur-[58.33px]"
                    : "border border-[#181B22] bg-black backdrop-blur-[58.33px]",
                )}
              >
                <span
                  className={cn(
                    "w-5 h-5 flex items-center justify-center",
                    activeSubTab === subTab.id ? "text-white" : "text-[#B0B0B0]"
                  )}
                >
                  {subTab.icon}
                </span>
                <span
                  className={cn(
                    "text-[15px] font-bold leading-normal",
                    activeSubTab === subTab.id ? "text-white" : "text-[#B0B0B0]"
                  )}
                  style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
                >
                  {subTab.label}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Social Network Sub-tabs (shown only when Social Network main tab is active) */}
        {activeMainTab === "social" && (
          <div className="inline-flex flex-wrap items-center gap-2 p-1 rounded-[36px] border border-[#181B22] bg-black backdrop-blur-[50px]">
            {socialSubTabs.map((subTab) => (
              <button
                key={subTab.id}
                onClick={() => {
                  setActiveSocialSubTab(subTab.id);
                }}
                className={cn(
                  "flex h-8 items-center justify-center gap-2 px-4 py-3 rounded-[32px] transition-all whitespace-nowrap",
                  activeSocialSubTab === subTab.id
                    ? "bg-gradient-to-l from-[#A06AFF] to-[#482090] backdrop-blur-[58.33px]"
                    : "border border-[#181B22] bg-black backdrop-blur-[58.33px]",
                )}
              >
                <span
                  className={cn(
                    "w-5 h-5 flex items-center justify-center",
                    activeSocialSubTab === subTab.id ? "text-white" : "text-[#B0B0B0]"
                  )}
                >
                  {subTab.icon}
                </span>
                <span
                  className={cn(
                    "text-[15px] font-bold leading-normal",
                    activeSocialSubTab === subTab.id ? "text-white" : "text-[#B0B0B0]"
                  )}
                  style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
                >
                  {subTab.label}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tab content */}
      <div className="mt-4">
        {/* Dashboard Tab */}
        {activeMainTab === "dashboard" && <Dashboard />}

        {/* Profile Tab with Sub-tabs */}
        {activeMainTab === "profile" && (
          <>
            {activeSubTab === "overview" && <ProfileOverview />}

            {activeSubTab === "security" && <SecuritySettings />}
            {activeSubTab === "notifications" && <NotificationsSettings />}
            {activeSubTab === "billing" && <BillingSettings />}
            {activeSubTab === "referrals" && <ReferralsSettings />}
            {activeSubTab === "kyc" && <KycSettings />}
          </>
        )}

        {/* Social Network Tab with Sub-tabs */}
        {activeMainTab === "social" && (
          <>
            {activeSocialSubTab === "overview" && <SocialOverview />}

            {activeSocialSubTab === "my-posts" && (
              <div className="container-card p-6">
                <h2 className="text-xl font-semibold text-white">My Posts</h2>
                <p className="mt-4 text-sm text-webGray">
                  Create, edit, and manage your social media posts.
                </p>
              </div>
            )}

            {activeSocialSubTab === "monetization" && (
              <div className="container-card p-6">
                <h2 className="text-xl font-semibold text-white">Monetization</h2>
                <p className="mt-4 text-sm text-webGray">
                  Track your earnings, set up payment methods, and manage monetization settings.
                </p>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <span className="text-xs uppercase text-webGray">Total Earnings</span>
                    <span className="mt-1 text-lg font-bold text-white">$0.00</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs uppercase text-webGray">This Month</span>
                    <span className="mt-1 text-lg font-bold text-green">$0.00</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={socialProfileData}
        onSave={handleSaveProfile}
        onAvatarUpload={handleAvatarUpload}
        onCoverUpload={handleCoverUpload}
      />
    </div>
  );
};

export default ProfileIntegrated;
