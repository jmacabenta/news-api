import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import {
  setTopHeadlines,
  nextPage,
  setLoadingMore,
  setKeyword,
  setTotalResults,
  resetPage,
} from '../../features/news/newsSlice';
import './Home.scss';

const apiKey = process.env.REACT_APP_NEWS_API_KEY;

const Home = () => {
  const page = useSelector((state) => state.news.page);
  const newsData = useSelector((state) => state.news.topHeadlines);
  const isLoadingMore = useSelector((state) => state.news.isLoadingMore);
  const keyword = useSelector((state) => state.news.keyword);
  const totalDataResults = useSelector((state) => state.news.totalResults);
  const dispatch = useDispatch();
  let navigate = useNavigate();
  const { isLoading, error, data } = useQuery('topHeadlines', () =>
    fetch(`https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`).then((res) => res.json())
  );

  useEffect(() => {
    const { articles, totalResults } = data || {};
    dispatch(setKeyword(''));
    dispatch(setTopHeadlines(articles || []));
    dispatch(setTotalResults(totalResults || 0));
  }, [data, dispatch]);

  const onChangeKeyword = (ev) => dispatch(setKeyword(ev.target.value));

  const handleSearch = (ev) => {
    if (ev.key === 'Enter') {
      dispatch(resetPage());
      navigate('/search', { replace: true });
    }
  };

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
        `https://newsapi.org/v2/top-headlines?country=us&page=${page + 1}&apiKey=${apiKey}`
      );
      const {
        data: { articles: newArticles },
      } = response;
      dispatch(setTopHeadlines([...newsData, ...newArticles]));
      dispatch(nextPage());
      dispatch(setLoadingMore(false));
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="container">
      <div className="Home">
        <h1>Home</h1>
        <div className="articles-search">
          <input onChange={onChangeKeyword} onKeyUp={handleSearch} type="search" value={keyword} placeholder="Search" />
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
                <p className="noData">No data found or API key has been exhausted.</p>
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
            <p>Loading ...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
