import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import moment from 'moment';
import './Article.scss';

const Article = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state;
  const { source, author, title, description, urlToImage, publishedAt, content } = data || {};
  const { name: sourceName } = source || {};

  return (
    <div className="container">
      <div className="Article">
        <h1>Article</h1>
        <span onClick={() => navigate(-1)}>&lt; Go back</span>
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

export default Article;
