import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useSelector, useDispatch } from 'react-redux';
import debounce from 'lodash/debounce';
import orderBy from 'lodash/orderBy';
import sumBy from 'lodash/sumBy';
import includes from 'lodash/includes';
import axios from 'axios';
import {
  addToNewsData,
  nextPage,
  setLoadingMore,
  setKeyword,
  setTotalResults,
  setSorting,
} from '../../features/news/newsSlice';
import './Home.scss';

const apiKey = process.env.REACT_APP_NEWS_API_KEY;

const Home = () => {
  const page = useSelector((state) => state.news.page);
  const newsData = useSelector((state) => state.news.dataSource);
  const isLoadingMore = useSelector((state) => state.news.isLoadingMore);
  const keyword = useSelector((state) => state.news.keyword);
  const totalDataResults = useSelector((state) => state.news.totalResults);
  const sorting = useSelector((state) => state.news.sorting);
  const dispatch = useDispatch();
  const { isLoading, error, data } = useQuery('newsData', () =>
    fetch(`https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`).then((res) => res.json())
  );

  useEffect(() => {
    if (!isLoading && newsData?.length < 1 && data && !keyword) {
      const { articles, totalResults } = data || {};
      dispatch(addToNewsData(articles));
      dispatch(setTotalResults(totalResults));
    }
  }, [isLoading, newsData, data, dispatch, keyword]);

  const handleChangeKeyword = async (val) => {
    const newsApiToget = val
      ? `https://newsapi.org/v2/top-headlines?country=us&q=${val.toLowerCase()}&apiKey=${apiKey}`
      : `https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`;
    try {
      const response = await axios.get(newsApiToget);
      const {
        data: { articles: newArticles, totalResults },
      } = response;
      dispatch(addToNewsData(newArticles));
      dispatch(setTotalResults(totalResults));
      if (newArticles?.length > 0) {
        dispatch(
          setSorting({
            sortValue: val ? sorting : 'publishedAt',
            newsData: newArticles,
            keyword: val ? val.toLowerCase() : '',
          })
        );
      }
    } catch (err) {
      console.log(err);
    }
    dispatch(setKeyword(val.toLowerCase()));
  };

  const onChangeKeyword = debounce((ev) => handleChangeKeyword(ev.target.value), 500);

  if (isLoading) {
    return (
      <div className="loading-container">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>An error has occurred: {error.message}</p>
      </div>
    );
  }

  const handleLoadMore = () => {
    dispatch(setLoadingMore(true));
    axios
      .get(`https://newsapi.org/v2/top-headlines?country=us&page=${page + 1}&apiKey=${apiKey}`)
      .then((res) => {
        const {
          data: { articles: newArticles },
        } = res;
        dispatch(addToNewsData([...newsData, ...newArticles]));
        dispatch(nextPage());
        dispatch(setLoadingMore(false));
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleSorting = async (ev) => {
    const sortValue = ev.target.value;
    let sortedData;
    switch (sortValue) {
      case 'popularity':
        // Generate popularity data for news
        // Since news api doesn't include popularity data
        // There might be times that popularity and relevance will show same order
        // For example: 4 articles by relevance have all the same count (ex. 1) in the descending order of: A, B, C, D
        // Coincidentally, 4 articles by popularity have this in order: A = 50, B = 40, C = 30, D = 20
        // So it may look like nothing has change
        const withPopularityData = await Promise.all(newsData?.map((data) => {
          let rand = Math.random() * 100;
          rand = Math.floor(rand);

          // Check if popularity data exist
          // So that we won't change what was previously set
          return { ...data, popularity: data?.popularity ?? rand };
        }));
        sortedData = orderBy(withPopularityData, ['popularity'], ['desc']);
        break;
      case 'relevance':
        // Generate relevance data for news based on keyword
        // There might be times that popularity and relevance will show same order
        // For example: 4 articles by relevance have all the same count (ex. 1) in the descending order of: A, B, C, D
        // Coincidentally, 4 articles by popularity have this in order: A = 50, B = 40, C = 30, D = 20
        // So it may look like nothing has change
        const withRelevanceData = await Promise.all(newsData?.map((data) => {
          const stringCount = (str, ch) => {
            const strArray = str.split(' ');
            return sumBy(strArray, (x) => x.toLowerCase() === ch || includes(x.toLowerCase(), ch));
          };
          let relevance = 0;
          const sourceString = data?.source?.name ? stringCount(data.source?.name, keyword) : 0;
          const titleString = data?.title ? stringCount(data?.title, keyword) : 0;
          const descString = data?.description ? stringCount(data?.description, keyword) : 0;
          const contentString = data?.content ? stringCount(data?.content, keyword) : 0;
          relevance = sourceString + titleString + descString + contentString;

          return { ...data, relevance };
        }));
        sortedData = orderBy(withRelevanceData, ['relevance'], ['desc']);
        break;
      case 'publishedAt':
      default:
        sortedData = orderBy(newsData, ['publishedAt'], ['desc']);
        break;
    }
    dispatch(setSorting(sortValue));
    dispatch(addToNewsData(sortedData));
  };

  return (
    <div className="container">
      <div className="Home">
        <div className="articles-search">
          <input onChange={onChangeKeyword} type="search" defaultValue={keyword} placeholder="Search" />
          {keyword && newsData?.length > 0 && (
            <select value={sorting} onChange={handleSorting}>
              <option value="publishedAt">Published Date</option>
              <option value="popularity">Popularity</option>
              <option value="relevance">Relevance</option>
            </select>
          )}
        </div>
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
      </div>
    </div>
  );
};

export default Home;
