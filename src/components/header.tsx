import { MainNav } from "@/components/main-nav"
import { MobileNav } from "@/components/mobile-nav"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4">
        <div className="flex-1 flex items-center">
          <div className="md:hidden">
            <MobileNav />
          </div>
          <div className="hidden md:block w-full">
            <MainNav />
          </div>
        </div>
      </div>
    </header>
  )
}

