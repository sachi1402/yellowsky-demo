import type { FC } from "react"
import Link from "next/link"

export const Logo: FC = () => {
  return (
    <Link href="/" className="flex items-center">
      <div className="flex items-center">
        <span className="text-yellow-400 font-bold text-2xl">yello</span>
        <span className="text-blue-500 font-bold text-2xl">skye</span>
      </div>
    </Link>
  )
}
