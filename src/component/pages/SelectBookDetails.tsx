import React from 'react';
import { useBookDetailsSearch } from '../../hooks/useBookDetailsSearch';
import { getBookId } from '../../utils/getBookId';
import { remoteConfig, refreshConfig, analytics } from '../../utils/initFirebase';
import { KindleBook } from "../../utils/parseKindleHighlights";
import { getValue } from "firebase/remote-config";
import { FirebaseConfigKeys } from '../../constants';
import { logEvent } from "firebase/analytics";
import { getBookQuery } from '../../utils/getBookQuery';

export interface BookDetailsSelectorProps {
  books: Array<KindleBook>;
}

export const BookDetailsSelector: React.FC<BookDetailsSelectorProps> = ({ books }) => {
  const [selectedBook, setSelectedBook] = React.useState<KindleBook>(books[0]);
  const [amazonAssociateTag, setAmazonAssociateTag] = React.useState<string | undefined>(remoteConfig.defaultConfig[FirebaseConfigKeys.AmazonAssociateTag]?.toString());
  const [searchQuery, setSearchQuery] = React.useState("");
  const {results: searchResults, search} = useBookDetailsSearch();

  React.useEffect(() => {
    const updateTag = () => {
      const newTag = getValue(remoteConfig, FirebaseConfigKeys.AmazonAssociateTag).asString();
      setAmazonAssociateTag(newTag);
    };

    if (remoteConfig.lastFetchStatus !== 'success') {
      refreshConfig().then(updateTag);
    } else {
      updateTag();
    }

    onSearch(getBookQuery(selectedBook));
  }, []);

  React.useEffect(() => {
    onSearch(getBookQuery(selectedBook));
  }, [selectedBook]);

  const onSelectBook = (book: KindleBook) => () => {
    logEvent(analytics, 'search', {
      search_term: [book.title, book.author].filter(Boolean).join(' ')
    });

    setSelectedBook(book);
  };

  const onSearch = (query?: string) => {
    if (query) {
      setSearchQuery(query);
    }
    
    search(query ?? searchQuery);
  }


  return <div className='flex flex-row gap-4 p-4'>
    <div className='basis-1/3 flex flex-col scroll-auto h-96 overflow-y-auto'>
      {books.map(book => <div className='border rounded flex flex-row grow items-center gap-2 px-2' key={getBookId(book)} onClick={onSelectBook(book)}>
          <div className="flex flex-col grow truncate" style={{flexGrow: 1}}>
            <div className="truncate text-lg">{book.title}</div>
            <div className="flex grow flex-row gap-1 justify-between">
              {book.author && <div className="truncate text-sm flex-1 grow">{book.author}</div>}
              <div className='text-sm'>Last Highlight {book.lastAnnotation.toLocaleDateString()}</div>
            </div>
          </div>
        </div>)}
    </div>
    <div className='basis-2/3 flex flex-col gap-4'>
      <div className='flex flex-row gap-4'>
        {/* @ts-ignore */}
        <input onChange={(e) => setSearchQuery(e.target.value)} type="text" className='flex-grow border rounded px-2' value={searchQuery} />
        <button onClick={onSearch}>Search</button>
        </div>
        <div className='grid grid-cols-3 gap-4 scroll-auto h-96 overflow-y-auto'>
      {searchResults.map(book => <div className='border rounded px-2 flex flex-col w-full'>
        <img src={book.imageUrl} className='w-full' />
        <div className='text-lg'>{book.title}</div>
        <div className='text-sm'>{book.author}</div>
        <div className='text-sm'><a href={`https://amazon.com${book.productPath}?tag=${amazonAssociateTag}`} target="_blank">View Book</a></div>
      </div>)}
      </div>
    </div>
  </div>;
}