import React from 'react';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import moment from 'moment';
import './NewsArticle.scss';

const NewsArticle = () => {
  const location = useLocation();
  const data = location.state;
  const { source, author, title, description, urlToImage, publishedAt, content } = data || {};
  const { name: sourceName } = source || {};

  return (
    <div className="container">
      <div className="NewsArticle">
        <Link to="/">&lt; Go back</Link>
        <div className="article-header">
          {urlToImage && <img alt="article-visual" src={urlToImage} />}
          <p>Source: {sourceName || 'N/A'}</p>
        </div>
        <div className="article-content">
          <h1>{title}</h1>
          {description && <h3>- {description} -</h3>}
          <p className="article-meta">
            {author}
            {author ? ' | ' : ''}
            {publishedAt && moment(publishedAt).format('MMMM DD YYYY')}
          </p>
          <p>{content}</p>
        </div>
      </div>
    </div>
  );
};

export default NewsArticle;
