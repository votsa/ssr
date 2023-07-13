/**
 * Loader
 */
export function HotelsListFallback({items = 4}) {
  return (
    <>
      {Array(items).fill(1).map((_, n) => (
        <div key={n}>
          <div className="w-full p-3 flex max-w-full flex-col md:max-w-full md:flex-row md:items-start md:text-left">
            <div className="mb-4 md:mr-6 md:mb-0 md:w-96">
              <div className="rounded-lg overflow-hidden animate-pulse" role="status">
                <div className="h-48 bg-gray-200 dark:bg-gray-700 w-full" />
                <div className="flex items-center space-x-1 pt-1" >
                  {[1,2,3].map((_, n) => (
                    <div key={n} className="h-14 bg-gray-200 dark:bg-gray-700 w-24" />
                  ))}
                </div>
              </div>
            </div>
            <div className="w-full animate-pulse" role="status">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 w-2/12 mb-2" />
              <div className="h-6 bg-gray-200 dark:bg-gray-700 w-7/12 mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 w-4/12 mb-7" />
              {[1,2,3].map((i, n) => (
                <div key={n} className="h-9 bg-gray-200 dark:bg-gray-700 my-4 w-full" />
              ))}
            </div>
          </div>
          <div className="border-b mx-3 my-3" />
        </div>
      ))}
   </>
  )
}
