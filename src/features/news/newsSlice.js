import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  dataSource: [],
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
    addToNewsData: (state, action) => {
      state.dataSource = action.payload;
    },
    nextPage: (state) => {
      state.page += 1;
      state.isLoadingMore = true;
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

export const { addToNewsData, nextPage, setLoadingMore, setKeyword, setTotalResults, setSorting } = newsSlice.actions;

export default newsSlice.reducer;
