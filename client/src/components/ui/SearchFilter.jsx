import React from 'react';
import Input from './Input';
import Select from './Select';
import { MdSearch, MdFilterList, MdSort } from 'react-icons/md';

const SearchFilter = ({
  search,
  setSearch,
  category,
  setCategory,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  categories = [],
}) => {
  const categoryOptions = [
    { value: 'All', label: 'All Categories' },
    ...categories.map((cat) => ({ value: cat, label: cat })),
  ];

  const sortOptions = [
    { value: 'date', label: 'Sort by Date' },
    { value: 'amount', label: 'Sort by Amount' },
    { value: 'title', label: 'Sort by Name' },
  ];

  const orderOptions = [
    { value: 'desc', label: 'Descending' },
    { value: 'asc', label: 'Ascending' },
  ];

  return (
    <div className="glass-card p-5 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <Input
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<MdSearch className="w-5 h-5" />}
          />
        </div>

        {/* Category Filter */}
        <div>
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={categoryOptions}
            icon={<MdFilterList className="w-4 h-4" />}
          />
        </div>

        {/* Start Date */}
        <div>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        {/* End Date */}
        <div>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        {/* Sort controls */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              options={sortOptions}
            />
          </div>
          <div className="flex-1">
            <Select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              options={orderOptions}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchFilter;
