import React from "react";

/* eslint-disable no-unused-vars */
interface Props {
  defaultText: string;
  onChange: (str: string) => void;
}
/* eslint-enable no-unused-vars */

const SearchBar: React.FC<Props> = ({ defaultText, onChange }) => (
  <div className="search-bar">
    <input
      type="text"
      className="round-corners search-input"
      size={20}
      placeholder={defaultText}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export default SearchBar;
