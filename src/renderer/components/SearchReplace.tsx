import * as React from 'react';
import { commandsService } from '../services/commandsService';
import { createSearchCommand, createReplaceCommand } from '../commands/workbenchCommands';
import './SearchReplace.css';

interface SearchReplaceProps {
  isVisible: boolean;
}

export const SearchReplace: React.FC<SearchReplaceProps> = ({ isVisible }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [replaceTerm, setReplaceTerm] = React.useState('');
  const [useRegex, setUseRegex] = React.useState(false);
  const [caseSensitive, setCaseSensitive] = React.useState(false);
  const [wholeWord, setWholeWord] = React.useState(false);
  const [fileWide, setFileWide] = React.useState(false);

  if (!isVisible) return null;

  const handleSearch = () => {
    commandsService.executeCommand(createSearchCommand(searchTerm, {
      useRegex,
      caseSensitive,
      wholeWord,
      fileWide
    }));
  };

  const handleReplace = () => {
    commandsService.executeCommand(createReplaceCommand(searchTerm, replaceTerm, {
      useRegex,
      caseSensitive,
      wholeWord,
      fileWide
    }));
  };

  return (
    <div className="search-replace">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search"
      />
      <input
        type="text"
        value={replaceTerm}
        onChange={(e) => setReplaceTerm(e.target.value)}
        placeholder="Replace"
      />
      <div className="search-options">
        <label>
          <input
            type="checkbox"
            checked={useRegex}
            onChange={(e) => setUseRegex(e.target.checked)}
          />
          Use Regex
        </label>
        <label>
          <input
            type="checkbox"
            checked={caseSensitive}
            onChange={(e) => setCaseSensitive(e.target.checked)}
          />
          Case Sensitive
        </label>
        <label>
          <input
            type="checkbox"
            checked={wholeWord}
            onChange={(e) => setWholeWord(e.target.checked)}
          />
          Whole Word
        </label>
        <label>
          <input
            type="checkbox"
            checked={fileWide}
            onChange={(e) => setFileWide(e.target.checked)}
          />
          File-wide
        </label>
      </div>
      <button onClick={handleSearch}>Search</button>
      <button onClick={handleReplace}>Replace</button>
    </div>
  );
};