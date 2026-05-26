import type { Member } from '@/types'

interface Props {
  member: Member
}

export default function MemberCard({ member }: Props) {
  return (
    <div className="member-item" title={member.name}>
      <img
        src={member.image}
        alt={member.name}
        width={20}
        height={20}
        loading="lazy"
        decoding="async"
        className="h-5 w-5 object-contain opacity-70"
      />
      <span className="truncate text-xs text-[--color-subtle]">{member.name}</span>
    </div>
  )
}
