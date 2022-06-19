import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useSelector, useDispatch } from 'react-redux';
import debounce from 'lodash/debounce';
import axios from 'axios';
import {
  setSearchResults,
  nextPage,
  setLoadingMore,
  setKeyword,
  setTotalResults,
  setSorting,
} from '../../features/news/newsSlice';
import './Search.scss';

const apiKey = process.env.REACT_APP_NEWS_API_KEY;

const Search = () => {
  const page = useSelector((state) => state.news.page);
  const newsData = useSelector((state) => state.news.searchResults);
  const isLoadingMore = useSelector((state) => state.news.isLoadingMore);
  const keyword = useSelector((state) => state.news.keyword);
  const totalDataResults = useSelector((state) => state.news.totalResults);
  const sorting = useSelector((state) => state.news.sorting);
  const dispatch = useDispatch();
  const { isLoading, error, data } = useQuery('searchResults', () =>
    fetch(`https://newsapi.org/v2/everything?q=${keyword}&sortBy=${sorting}&apiKey=${apiKey}`).then((res) => res.json())
  );

  useEffect(() => {
    const { articles, totalResults } = data || {};
    dispatch(setSearchResults(articles || []));
    dispatch(setTotalResults(totalResults || 0));
  }, [data, dispatch]);

  const handleChangeKeyword = async (val) => {
    if (val) {
      try {
        const response = await axios.get(
          `https://newsapi.org/v2/everything?q=${val}&sortBy=${sorting}&apiKey=${apiKey}`
        );
        const {
          data: { articles: newArticles, totalResults },
        } = response;
        dispatch(setSearchResults(newArticles));
        dispatch(setTotalResults(totalResults));
      } catch (err) {
        console.log(err);
      }
    } else {
      dispatch(setSearchResults([]));
      dispatch(setTotalResults(0));
    }

    dispatch(setKeyword(val));
  };

  const onChangeKeyword = debounce((ev) => handleChangeKeyword(ev.target.value), 500);

  if (error) {
    return (
      <div className="error-container">
        <p>An error has occurred: {error.message}</p>
      </div>
    );
  }

  const handleLoadMore = async () => {
    dispatch(setLoadingMore(true));

    try {
      const response = await axios.get(
        `https://newsapi.org/v2/everything?q=${keyword}&sortBy=${sorting}&page=${page + 1}&apiKey=${apiKey}`
      );
      const {
        data: { articles: newArticles },
      } = response;
      dispatch(setSearchResults([...newsData, ...newArticles]));
      dispatch(nextPage());
      dispatch(setLoadingMore(false));
    } catch (err) {
      console.log(err);
    }
  };

  const handleSorting = async (ev) => {
    const sortValue = ev.target.value;

    try {
      const response = await axios.get(
        `https://newsapi.org/v2/everything?q=${keyword}&sortBy=${sortValue}&apiKey=${apiKey}`
      );
      const {
        data: { articles: newArticles },
      } = response;
      dispatch(setSearchResults(newArticles));
    } catch (err) {
      console.log(err);
    }
    dispatch(setSorting(sortValue));
  };

  return (
    <div className="container">
      <div className="Search">
        <h1>Search</h1>
        <Link to="/">&lt; Home</Link>
        <div className="articles-search">
          <input onChange={onChangeKeyword} type="search" defaultValue={keyword} placeholder="Search" />
          <select value={sorting} onChange={handleSorting}>
            <option value="publishedAt">Published Date</option>
            <option value="popularity">Popularity</option>
            <option value="relevancy">Relevant</option>
          </select>
        </div>
        {!isLoading ? (
          <>
            <div className="articles-section">
              {newsData?.length > 0 ? (
                newsData?.map((article, index) => {
                  const { title, urlToImage, description } = article || {};
                  return (
                    <div key={`${index}-${title}`} className="news-box">
                      <div className="news-img">{urlToImage && <img alt="article-visual" src={urlToImage} />}</div>
                      <div className="news-info">
                        <h3>{title}</h3>
                        {description && <p>{description}</p>}
                        <Link to="/article" state={article}>
                          READ FULL ARTICLE &gt;
                        </Link>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="noData">
                  {keyword ? 'No data found or API key has been exhausted.' : 'Enter a keyword to search'}
                </p>
              )}
            </div>

            {newsData && newsData.length < totalDataResults && (
              <div className="load-more">
                <div className="load-more-btn" onClick={handleLoadMore}>
                  {isLoadingMore ? 'Loading...' : 'Load more'}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="loading-container">
            <p>Loading...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
