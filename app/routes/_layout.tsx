import { useCallback, useEffect, useRef, useState } from "react";
import { Form, Outlet, NavLink, useLocation } from "@remix-run/react";
import { useUser, SignOutButton } from "@clerk/remix";
import PostIcon from "~/components/icons/PostIcon";
import SearchIcon from "~/components/icons/SearchIcon";
import LogoutIcon from "~/components/icons/LogoutIcon";
import MenuIcon from "~/components/icons/MenuIcon";
import ThemeSwitcher from "~/components/ThemeSwitcher";
import { Footer } from "~/components/Footer";
import { useAtom } from "jotai";
import { isSignedInAtom, setAuthStateAtom } from "~/stores/auth";
import { getNavItems } from "~/utils/itemMenu";


function renderDesktopHeader(){
  const [ isSignedIn ] = useAtom(isSignedInAtom);
  const navItems = getNavItems(isSignedIn);
  const location = useLocation();
  const currentLocation = `${location.pathname}${location.search ? `${location.search}` : ""}`;
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  
  return (
    <>
      <div 
        className={`fixed top-0 left-0 h-screen bg-base-100 border-r border-base-200 overflow-y-auto flex flex-col transition-all duration-300 z-50
          w-16 hover:w-64 2xl:w-64 group`}
        onMouseEnter={() => setIsSidebarExpanded(true)}
        onMouseLeave={() => setIsSidebarExpanded(false)}
      >
        <div className="p-4 flex-grow overflow-y-auto">
          <nav>
            <ul className="flex flex-col gap-2">
              {navItems.map((item) => {
                const isActive = item.to === currentLocation;

                return (
                  <li key={item.to} className="h-[40px]">
                    {item.to === "/logout" ? (
                      <SignOutButton redirectUrl="/">
                        <div className={`flex items-center gap-2 p-2 rounded-lg hover:bg-base-300 ${isActive ? 'bg-base-200 font-bold' : ''}`}>
                          <item.icon className="w-5 h-5 stroke-current fill-none min-w-[1.25rem]" />
                          <span className="invisible w-0 group-hover:visible group-hover:w-auto 2xl:visible 2xl:w-auto whitespace-nowrap transition-all duration-300">
                            ログアウト
                          </span>
                        </div>
                      </SignOutButton>
                    ) : (
                      <NavLink 
                        to={item.to} 
                        className={`flex items-center gap-2 p-2 rounded-lg hover:bg-base-300 ${isActive ? 'bg-base-200 font-bold' : ''}`}
                      >
                        <item.icon className="w-5 h-5 stroke-current fill-none min-w-[1.25rem]" />
                        <span className="invisible w-0 group-hover:visible group-hover:w-auto 2xl:visible 2xl:w-auto whitespace-nowrap transition-all duration-300">
                          {item.text}
                        </span>
                      </NavLink>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
        <div className="border-t border-base-300 h-[60px] flex-shrink-0">
          <div className="p-4 flex items-center justify-center h-full">
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </>
  );
}

function renderMobileHeader(handleSearchModalOpen: (status: boolean) => void){
  const [ isSignedIn ] = useAtom(isSignedInAtom);
  const navItems = getNavItems(isSignedIn);

  return (
    <header className="navbar fixed z-40 border-b border-base-200 bg-base-100 flex justify-between p-4">
      <div>
        <h1 className="text-xl font-bold">
          <NavLink to="/?referrer=fromHeader">健常者エミュレータ事例集</NavLink>
        </h1>
      </div>
      <div className="flex flex-row">
        <div className="tooltip tooltip-left" data-tip="検索する">
          <button className="btn btn-ghost" onClick={() => {handleSearchModalOpen(true)}} type="button">
            <SearchIcon />
          </button>
        </div>
        <div>
          <div className="drawer drawer-end">
            <input id="drawer-toggle" type="checkbox" className="drawer-toggle" />
          <div className="drawer-content flex justify-end">
            <label htmlFor="drawer-toggle" className="btn btn-ghost">
              <MenuIcon />
            </label>
          </div>
          <div className="drawer-side">
            <div className="drawer-overlay" onClick={() => {
              document.getElementById('drawer-toggle')?.click();
            }} onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                document.getElementById('drawer-toggle')?.click();
              }
            }} />
            <div className="bg-base-200">
              <button
                className="btn btn-ghost absolute right-4 top-2"
                type="button"
                onClick={() => {
                  document.getElementById('drawer-toggle')?.click();
                }}
              >
                ✕
              </button>
              <div className="mt-3 ml-2">
                <ThemeSwitcher />
              </div>
              <ul className="p-4 w-50 text-base-content min-h-screen py-1 flex flex-col">
                {navItems.map((item) => (
                  <li key={item.to} className="justify-center">
                    {item.to === "/logout" ? (
                      <div
                        onClick={() => {
                          document.getElementById('drawer-toggle')?.click();
                          }}
                          className="flex gap-x-3 my-3 hover:bg-base-200 rounded-lg p-2 cursor-pointer"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              document.getElementById('drawer-toggle')?.click();
                            }
                          }}
                        > 
                          <LogoutIcon/>
                          <SignOutButton redirectUrl="/">
                            ログアウト
                          </SignOutButton>
                        </div>
                    ) : (
                      <NavLink to={item.to} onClick={() => {
                        document.getElementById('drawer-toggle')?.click();
                      }}
                      className="flex gap-x-3 my-3 hover:bg-base-200 rounded-lg p-2"
                      >
                        <item.icon className="w-5 h-5 stroke-current fill-none" />
                        {item.text}
                      </NavLink>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
  )
}


export default function Component() {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const user = useUser();
  const [ _, setAuthState ] = useAtom(setAuthStateAtom);
  
  useEffect(() => {
    if (user.isSignedIn) {
      const newAuthState = {
        isSignedIn: user.isSignedIn ?? false,
        userId: user.user?.id ?? null,
        email: user.user?.emailAddresses[0]?.emailAddress ?? null,
        userName: user.user?.username ?? null,
      };
      setAuthState(newAuthState);
    }
  }, [user.isSignedIn, setAuthState, user.user?.id, user.user?.emailAddresses, user.user?.username]);


  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const handleSearchModalOpen = useCallback((status: boolean) => {
    setIsSearchModalOpen(status);
  }, []);

  useEffect(()=> {
    if (isSearchModalOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
    return () => {
      if (searchInputRef.current) {
        // フォーカスを解除する
        searchInputRef.current.blur();
      }
    }
  }, [isSearchModalOpen]);

  useEffect(()=> {
    const handleKeyDownForSearch = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "k") {
        event.preventDefault();
        handleSearchModalOpen(true);
      }
      if (event.key === "Escape") {
        handleSearchModalOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDownForSearch);
    return () => window.removeEventListener('keydown', handleKeyDownForSearch);
  }, [handleSearchModalOpen]);

  const location = useLocation();
  const isInPostPage = location.pathname === "/post";


  return (
    <div className="min-h-screen flex flex-col">
      <div className="hidden md:block">
        {renderDesktopHeader()}
      </div>
      <div className="block md:hidden">
        {renderMobileHeader(handleSearchModalOpen)}
      </div>
      <main className={`p-4 md:ml-16 2xl:ml-64 mt-16 flex-grow ${isSidebarExpanded ? 'md:ml-64' : ''}`}>
        <div>
          <Outlet />
        </div>
      </main>
      <div className="tooltip tooltip-top fixed bottom-10 right-10" data-tip="投稿する">
        <NavLink to="/post">
          <button className={`btn btn-primary btn-circle btn-lg ${isInPostPage ? "hidden inert" : ""}`} type="button">
            <PostIcon />
          </button>
        </NavLink>
      </div>
      <Footer />
      <dialog id="search-modal" className={`modal ${isSearchModalOpen ? "modal-open" : ""}`}>
        <div className="modal-box absolute top-[25%] transform -translate-y-1/2">
          <div className="mt-6">
            <Form method="post" action="/search" className="flex flex-row" onSubmit={() => {
              handleSearchModalOpen(false);
            }}>
              <input
                type="text"
                name="query"
                placeholder="検索する..."
                className="input input-bordered w-full placeholder-slate-500"
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="btn btn-primary ml-4" onSubmit={() => {
                handleSearchModalOpen(false);
                setSearchQuery("");
              }}>
                <SearchIcon />
              </button>
              <input type="hidden" name="action" value="firstSearch" />
              <button type="button" className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={() => {
                handleSearchModalOpen(false);
              }}>✕</button>
            </Form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button type="submit" onClick={() => {
            handleSearchModalOpen(false);
          }}>閉じる</button>
        </form>
    </dialog>
    </div>
  );
}