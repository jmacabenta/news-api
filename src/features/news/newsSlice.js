import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  topHeadlines: [],
  searchResults: [],
  totalResults: 0,
  page: 1,
  isLoadingMore: false,
  keyword: '',
  sorting: 'publishedAt',
};

export const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    setTopHeadlines: (state, action) => {
      state.topHeadlines = action.payload;
    },
    setSearchResults: (state, action) => {
      state.searchResults = action.payload;
    },
    nextPage: (state) => {
      state.page += 1;
    },
    resetPage: (state) => {
      state.page = 1;
    },
    setLoadingMore: (state, action) => {
      state.isLoadingMore = action.payload;
    },
    setKeyword: (state, action) => {
      state.keyword = action.payload;
      state.page = 1;

      if (!action.payload) {
        state.sorting = 'publishedAt';
      }
    },
    setTotalResults: (state, action) => {
      state.totalResults = action.payload;
    },
    setSorting: (state, action) => {
      state.sorting = action.payload;
    },
  },
});

export const {
  setTopHeadlines,
  setSearchResults,
  nextPage,
  setLoadingMore,
  setKeyword,
  setTotalResults,
  setSorting,
  resetPage,
} = newsSlice.actions;

export default newsSlice.reducer;
