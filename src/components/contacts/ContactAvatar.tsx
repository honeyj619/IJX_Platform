import { getContactAvatarGradient, getContactAvatarLabel } from '@/data/people';
import { CONTACT_STATUS_DOT } from '@/constants/contactStatus';
import type { ContactPerson } from '@/data/contactDirectory';

interface ContactAvatarProps {
  name: string;
  status?: ContactPerson['status'];
  size?: number;
  showStatus?: boolean;
  /** 头像外圈（如名片大头像的白边） */
  ringClassName?: string;
  className?: string;
}

/** 通讯录头像：品牌色系渐变 + 姓名后两字，本地生成，不依赖远程头像服务 */
export default function ContactAvatar({ name, status, size = 44, showStatus = false, ringClassName = '', className = '' }: ContactAvatarProps) {
  const dotSize = Math.max(8, Math.round(size * 0.22));
  return (
    <span className={`relative inline-flex shrink-0 ${className}`} style={{ width: size, height: size }}>
      <span
        className={`flex h-full w-full select-none items-center justify-center overflow-hidden rounded-full font-semibold leading-none text-white ${ringClassName}`}
        style={{ background: getContactAvatarGradient(name), fontSize: Math.round(size * 0.36) }}
        aria-hidden="true"
      >
        {getContactAvatarLabel(name)}
      </span>
      {showStatus && status ? (
        <span
          className={`absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-white dark:border-gray-900 ${CONTACT_STATUS_DOT[status]}`}
          style={{ width: dotSize, height: dotSize }}
          aria-hidden="true"
        />
      ) : null}
    </span>
  );
}
