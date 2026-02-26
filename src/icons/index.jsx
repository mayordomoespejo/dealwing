/**
 * @typedef {Object} IconProps
 * @property {number} [size]
 * @property {string} [className]
 */

/**
 * DealWing paper plane logo icon.
 * @param {IconProps & {variant?: 'inverse'}} props
 * @returns {JSX.Element}
 */
export function PaperPlaneIcon({ size = 28, className, variant, ...props }) {
  const isInverse = variant === 'inverse'
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 -4.15 57.875 57.875"
      xmlns="http://www.w3.org/2000/svg"
      fill={isInverse ? 'var(--color-brand)' : 'var(--color-surface)'}
      stroke={isInverse ? '#ffffff' : 'currentColor'}
      className={className}
      aria-hidden="true"
      {...props}
    >
      <g transform="translate(-1209.722 -1357.465)">
        <path
          d="M1224.729,1387.963v16.4l26.032-28.734Z"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4"
        />
        <path
          d="M1228.118,1390.522l37.479-30.686-17.1,45.207Z"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4"
        />
        <path
          d="M1211.722,1378.673l16.4,11.712,37.479-30.92Z"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4"
        />
      </g>
    </svg>
  )
}

/**
 * Globe icon used in empty states.
 * @param {IconProps} props
 * @returns {JSX.Element}
 */
export function GlobeIcon({ size = 48, className, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 1024 1024"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path
        d="M514.5 516.6m-484.5 0a484.5 484.5 0 1 0 969 0 484.5 484.5 0 1 0-969 0Z"
        fill="transparent"
      />
      <path
        d="M514.5 1011c-66.7 0-131.5-13.1-192.5-38.9-58.9-24.9-111.8-60.6-157.2-106-45.4-45.4-81.1-98.3-106-157.2-25.8-61-38.9-125.7-38.9-192.5S33 384.9 58.8 323.9c24.9-58.9 60.6-111.8 106-157.2 45.4-45.4 98.3-81.1 157.2-106 61-25.8 125.7-38.9 192.5-38.9S646 35.2 707 61c58.9 24.9 111.8 60.6 157.2 106 45.4 45.4 81.1 98.3 106 157.2 25.8 61 38.9 125.7 38.9 192.5S996 648.2 970.2 709.2c-24.9 58.9-60.6 111.8-106 157.2-45.4 45.4-98.3 81.1-157.2 106-61 25.6-125.7 38.6-192.5 38.6z m0-968.9c-64.1 0-126.2 12.5-184.7 37.3-56.5 23.9-107.2 58.1-150.8 101.7-43.6 43.6-77.8 94.3-101.7 150.8C52.6 390.4 40 452.5 40 516.6s12.5 126.2 37.3 184.7c23.9 56.5 58.1 107.2 101.7 150.8 43.6 43.6 94.3 77.8 150.8 101.7 58.5 24.7 120.6 37.3 184.7 37.3s126.2-12.5 184.7-37.3c56.5-23.9 107.2-58.1 150.8-101.7s77.8-94.3 101.7-150.8c24.7-58.5 37.3-120.6 37.3-184.7s-12.5-126.2-37.3-184.7c-23.9-56.5-58.1-107.2-101.7-150.8-43.6-43.6-94.3-77.8-150.8-101.7-58.5-24.7-120.6-37.3-184.7-37.3z"
        fill="none"
        stroke="var(--color-brand)"
        strokeWidth="24"
      />
      <path
        d="M528 32.8c-59.5 70.5-113.4 163.3 15.1 163.3 207.4 0 153.4 152.8-78.8 163.7-232.3 10.9-166.8 174.7-35.8 191 80.6 10.1 109.4 51.1 119.8 90.1v1.5c0 21.4 2.1 41.8 5.8 60.7v0.4c0 2.4 0.5 4.6 1.4 6.5 14.2 64.5 47.9 77.2 87.3 77.2 52.2 0 87.2-108.9 93.5-168.8 9.7-90.8 101.9-90.2 96.1-204.2-1.7-32.9 84.3-34.1 148.2-29C924.5 185.8 744 38.7 528 32.8z"
        fill="none"
        stroke="var(--color-brand)"
        strokeWidth="20"
      />
      <path
        d="M642.7 797.4c-36.4 0-80.2-9.6-96.9-84.1-1.1-2.8-1.7-5.9-1.8-9.1-3.8-20.2-5.8-40.9-5.8-61.7v-0.3c-13-47-49.4-73.7-111-81.4-34.9-4.4-67.4-18.9-91.4-40.9-23.8-21.8-36.8-49-35.8-74.7 0.7-18 8.4-43.8 41.4-64.6 28.4-17.9 69.6-28.2 122.4-30.7 76.5-3.6 124-21.9 150.4-36.7 30.6-17.1 48.6-38.6 48.1-57.4-0.5-22.9-32.1-49.6-119.2-49.6-45.4 0-73.7-11.6-84.3-34.4-8.3-17.9-5-41.9 9.9-71.2 11-21.6 28.4-46.6 51.7-74.2 2-2.3 4.9-3.6 7.9-3.5 54 1.5 106.9 11.6 157.2 30.1 48.7 17.9 94.1 43.4 135 75.7 40.5 32 75.6 69.9 104.4 112.7 29.2 43.5 51.2 91 65.3 141.3 0.9 3.1 0.2 6.5-1.9 9.1-2.1 2.5-5.3 3.9-8.5 3.6-69.5-5.6-121.1-0.8-134.8 12.5-2.5 2.4-2.7 4.4-2.7 6 3.4 67-26 98.2-52 125.7-20.6 21.9-40.1 42.5-44.1 80-3.7 34.9-15.7 78-30.5 110-20.5 44.4-45.7 67.8-73 67.8zM532.5 42.9c-46.2 55.5-65.9 98.2-55.6 120.4 8.8 18.8 40.8 22.8 66.2 22.8 43 0 77.2 6.3 101.6 18.7 23.7 12.1 37.1 30 37.5 50.5 0.6 26.8-20.6 54.3-58.3 75.3-28.3 15.8-78.8 35.4-159.2 39.2-89 4.2-143.1 32.6-144.8 76.1-0.8 19.8 9.9 41.4 29.3 59.2 21 19.3 49.6 32 80.4 35.8 70.2 8.8 113.4 41.6 128.2 97.5 0.2 0.8 0.3 1.7 0.3 2.6v1.5c0 19.8 1.9 39.6 5.6 58.8 0.1 0.6 0.2 1.3 0.2 1.9v0.4c0 0.9 0.2 1.7 0.5 2.4 0.3 0.6 0.5 1.3 0.7 2 12.6 57.5 40.2 69.3 77.6 69.3 25.1 0 45.2-35.2 54.9-56.1 16.9-36.6 26.1-78.8 28.7-103.7 4.7-44.2 27.5-68.3 49.4-91.6 25.5-27 49.6-52.6 46.6-111-0.4-8 2.6-15.4 8.7-21.3 11-10.6 32.2-17 65-19.4 24.1-1.8 50-1 70.8 0.2-13.6-43.2-33.2-84.1-58.6-121.9-27.6-41.1-61.3-77.5-100.2-108.2-39.2-31-82.8-55.4-129.6-72.6-46.7-17.2-95.8-26.9-145.9-28.8z"
        fill="none"
        stroke="var(--color-brand)"
        strokeWidth="20"
      />
    </svg>
  )
}

/**
 * Heart icon.
 * @param {IconProps & {fill?: string}} props
 * @returns {JSX.Element}
 */
export function HeartIcon({ size = 24, fill = 'none', className, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

/**
 * Sustainability sprout icon.
 * @param {IconProps} props
 * @returns {JSX.Element}
 */
export function SproutIcon({ size = 24, className, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path
        fill="currentColor"
        d="M500.216 29.351l-.259-.18c-6.914-4.92-16.501-10.586-27.578-15.388c-22.155-9.584-49.682-12.911-75.307-7.301c-25.641 5.537-49.393 19.942-65.75 37.609c-8.17 8.87-14.637 17.865-18.961 25.111a118.835 118.835 0 0 0-3.096 5.363c-1.5.636-3.019 1.32-4.527 2.106c-5.98 2.97-12.223 6.707-18.178 11.419c-5.983 4.674-11.791 10.167-17.204 16.305c-5.447 6.122-10.313 12.985-14.809 20.169c-4.529 7.181-8.399 14.823-11.885 22.586l-2.544 5.849l-2.288 5.912l-1.138 2.952l-1.017 2.972l-2.018 5.925c-.632 1.976-1.195 3.957-1.79 5.923c-.563 1.971-1.223 3.919-1.695 5.882l-.351 1.356c-2.977-4.441-6.186-8.574-9.602-12.304c-3.897-4.253-8-8.038-12.168-11.384c-8.354-6.688-17.021-11.458-25.014-14.84a105.989 105.989 0 0 0-12.94-4.4l.057-.201h.001v-.001h-.001s-3.876-2.797-10.027-5.934c-6.197-3.259-14.661-6.831-24.249-9.533c-19.173-5.387-42.047-5.064-62.378 2.355c-20.352 7.362-38.179 21.765-49.599 38.017c-5.7 8.156-9.992 16.225-12.727 22.627l-.083.188c-2.706 6.173-.128 13.413 5.868 16.491l.232.119c6.197 3.258 14.661 6.831 24.249 9.533c19.173 5.387 42.047 5.064 62.378-2.355c20.352-7.361 38.179-21.764 49.599-38.017a136.338 136.338 0 0 0 6.776-10.746a72.113 72.113 0 0 1 9.494 3.313c5.337 2.363 11.128 5.642 16.684 10.226c2.769 2.295 24.518 25.017 24.518 51.223a69.483 69.483 0 0 1 1.225 13.53l-.119 17.4l-.253 35.583l-1.357 190.767v.278c.077 10.779 39.11 10.501 39.033-.278l-1.357-190.767l-.1-14.001c.189-.991.285-2.016.273-3.064l-.121-11.022l-.022-2.753l.046-2.894l.099-6.52c.003-2.317.137-4.834.251-7.478c.131-2.642.2-5.433.397-8.324l.659-9.017c.244-3.114.637-6.305.961-9.604c.741-6.577 1.705-13.479 2.98-20.545l.459-2.668l.554-2.659l1.117-5.38c.341-1.819.856-3.584 1.279-5.396c.453-1.8.873-3.624 1.356-5.431l1.556-5.401l.781-2.716l.89-2.674l1.781-5.37l2.002-5.275c2.745-6.993 5.806-13.851 9.405-20.2c3.569-6.36 7.425-12.414 11.731-17.736c4.278-5.345 8.844-10.094 13.524-14.137c4.658-4.083 9.522-7.294 14.173-9.9c1.726-1.022 3.473-1.84 5.162-2.63c6.662 4.506 15.33 9.458 25.182 13.729c22.154 9.584 49.682 12.911 75.307 7.301c25.641-5.538 49.393-19.943 65.75-37.609c8.17-8.871 14.637-17.866 18.961-25.112l.13-.213c4.257-6.977 2.337-16.088-4.368-20.761z"
      />
    </svg>
  )
}

/**
 * Sun icon.
 * @param {IconProps} props
 * @returns {JSX.Element}
 */
export function SunIcon({ size = 24, className, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path
        d="M12 4V2M12 20V22M6.41421 6.41421L5 5M17.728 17.728L19.1422 19.1422M4 12H2M20 12H22M17.7285 6.41421L19.1427 5M6.4147 17.728L5.00049 19.1422M12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12C17 14.7614 14.7614 17 12 17Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * Moon icon.
 * @param {IconProps} props
 * @returns {JSX.Element}
 */
export function MoonIcon({ size = 24, className, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

/**
 * Calendar icon.
 * @param {IconProps} props
 * @returns {JSX.Element}
 */
export function CalendarIcon({ size = 24, className, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

/**
 * Clock icon.
 * @param {IconProps} props
 * @returns {JSX.Element}
 */
export function ClockIcon({ size = 24, className, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12,6 12,12 16,14" />
    </svg>
  )
}

/**
 * Takeoff icon.
 * @param {IconProps} props
 * @returns {JSX.Element}
 */
export function TakeoffIcon({ size = 24, className, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.30861 9.32091C2.99098 8.20166 3.17991 6.11489 4.67712 5.25048L5.111 4.99998C5.88795 4.5514 6.84569 4.55354 7.62063 5.00556L13.0823 8.19136C13.0881 8.19357 13.2153 8.23454 13.3392 8.24345C13.4083 8.24841 13.4629 8.24579 13.4972 8.24112L16.7261 6.37691C18.5291 5.33592 19.8243 5.18956 21.1108 5.6291C22.3557 6.05443 23.1642 6.96702 23.6367 7.68005C24.4315 8.87936 23.7792 10.2374 22.798 10.8039L8.07607 19.4539C6.93971 20.11 5.50884 19.9514 4.54367 19.0625L0.499997 15.3381C-0.540104 14.3802 0.201632 12.6469 1.61274 12.7379L5.29695 12.9755L7.26994 11.8364L4.30861 9.32091ZM5.67712 6.98253C5.37767 7.15541 5.33989 7.57277 5.60341 7.79662L9.1055 10.7715C9.89607 11.443 9.78272 12.6951 8.88439 13.2137L5.77252 15.0104L2.89477 14.8248L5.89861 17.5914C6.22033 17.8877 6.69729 17.9405 7.07607 17.7218L21.798 9.07189C21.8777 9.02589 22.0392 8.88988 21.9696 8.78491C21.6228 8.26167 21.1262 7.74788 20.4642 7.52169C19.8437 7.3097 19.1503 7.28671 17.7261 8.10896L14.4509 9.99991C14.0258 10.2453 13.5247 10.2619 13.1958 10.2383C12.8465 10.2132 12.4233 10.1223 12.0809 9.92261L6.61293 6.73314C6.45794 6.64274 6.26639 6.64231 6.111 6.73203L5.67712 6.98253Z"
        fill="currentColor"
      />
    </svg>
  )
}

/**
 * Landing icon.
 * @param {IconProps} props
 * @returns {JSX.Element}
 */
export function LandingIcon({ size = 24, className, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.98871 6.11765C7.84844 4.39452 9.45759 3.05255 11.1275 3.5L11.6114 3.62967C12.478 3.86187 13.1537 4.5406 13.3821 5.4082L14.9913 11.5229C15.0464 11.6461 15.1415 11.7693 15.2495 11.8514L18.8509 12.8164C20.8619 13.3553 22.0652 14.3516 22.6641 15.5721C23.2437 16.7531 23.1701 17.9701 23 18.8084C22.714 20.2185 21.2924 20.7176 20.198 20.4243L3.4876 15.9468C2.22016 15.6071 1.32049 14.4833 1.26659 13.1722L1.04079 7.67938C0.982711 6.26654 2.7328 5.56542 3.66625 6.62757L6.10337 9.40072L8.30396 9.99036L7.98871 6.11765ZM10.6099 5.43185C10.2759 5.34236 9.95406 5.61076 9.98211 5.95538L10.3549 10.5353C10.4391 11.5691 9.4736 12.3743 8.47165 12.1058L5.00081 11.1758L3.09717 9.00973L3.26491 13.0901C3.28287 13.5271 3.58276 13.9017 4.00524 14.0149L20.7157 18.4925C20.8045 18.5163 21.0149 18.5343 21.0399 18.4108C21.1647 17.7957 21.1769 17.0812 20.8687 16.4531C20.5798 15.8645 19.9217 15.1739 18.3333 14.7483L14.6802 13.7694C14.2062 13.6424 13.84 13.2998 13.6242 13.0505C13.395 12.7858 13.16 12.4223 13.0591 12.0389L11.4479 5.91723C11.4023 5.74371 11.2671 5.60796 11.0938 5.56152L10.6099 5.43185Z"
        fill="currentColor"
      />
    </svg>
  )
}

/**
 * Swap icon.
 * @param {IconProps} props
 * @returns {JSX.Element}
 */
export function SwapIcon({ size = 24, className, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M7 16V4m0 0L3 8m4-4 4 4" />
      <path d="M17 8v12m0 0 4-4m-4 4-4-4" />
    </svg>
  )
}

/**
 * Trash icon.
 * @param {IconProps} props
 * @returns {JSX.Element}
 */
export function TrashIcon({ size = 24, className, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  )
}

/**
 * Plus icon.
 * @param {IconProps} props
 * @returns {JSX.Element}
 */
export function PlusIcon({ size = 24, className, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M4 12H20M12 4V20" />
    </svg>
  )
}

/**
 * Minus icon.
 * @param {IconProps} props
 * @returns {JSX.Element}
 */
export function MinusIcon({ size = 24, className, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M6 12L18 12" />
    </svg>
  )
}

/**
 * Down chevron icon.
 * @param {IconProps} props
 * @returns {JSX.Element}
 */
export function ChevronDownIcon({ size = 24, className, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

/**
 * Info icon.
 * @param {IconProps} props
 * @returns {JSX.Element}
 */
export function InfoIcon({ size = 24, className, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}

/**
 * Check-circle icon.
 * @param {IconProps} props
 * @returns {JSX.Element}
 */
export function CheckCircleIcon({ size = 24, className, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

/**
 * X-circle icon.
 * @param {IconProps} props
 * @returns {JSX.Element}
 */
export function XCircleIcon({ size = 24, className, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  )
}

/**
 * Warning triangle icon.
 * @param {IconProps} props
 * @returns {JSX.Element}
 */
export function TriangleAlertIcon({ size = 24, className, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

/**
 * X icon.
 * @param {IconProps} props
 * @returns {JSX.Element}
 */
export function XIcon({ size = 24, className, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

/**
 * Search / magnifying-glass icon.
 * @param {IconProps} props
 * @returns {JSX.Element}
 */
export function SearchIcon({ size = 24, className, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

/**
 * List icon (three bullet rows).
 * @param {IconProps} props
 * @returns {JSX.Element}
 */
export function ListIcon({ size = 24, className, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  )
}

/**
 * Map pin / location marker icon.
 * @param {IconProps} props
 * @returns {JSX.Element}
 */
export function MapPinIcon({ size = 24, className, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

/**
 * Spinner icon.
 * @param {IconProps} props
 * @returns {JSX.Element}
 */
export function SpinnerIcon({ size = 16, className, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  )
}
