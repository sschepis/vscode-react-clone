import React, { useState, useEffect } from 'react';
import { gitService } from '../../services/GitService';
import { StatusResult, BranchSummary, LogResult } from 'simple-git';

const GitPanel: React.FC = () => {
  const [status, setStatus] = useState<StatusResult | null>(null);
  const [branches, setBranches] = useState<BranchSummary | null>(null);
  const [commitHistory, setCommitHistory] = useState<LogResult | null>(null);
  const [currentBranch, setCurrentBranch] = useState<string>('');
  const [commitMessage, setCommitMessage] = useState('');
  const [newBranchName, setNewBranchName] = useState('');

  useEffect(() => {
    updateGitInfo();
  }, []);

  const updateGitInfo = async () => {
    const newStatus = await gitService.getStatus();
    const branchInfo = await gitService.getBranches();
    const history = await gitService.getCommitHistory();
    setStatus(newStatus);
    setBranches(branchInfo);
    setCommitHistory(history);
    setCurrentBranch(branchInfo.current);
  };

  const handleStage = async (file: string) => {
    await gitService.add(file);
    updateGitInfo();
  };

  const handleCommit = async () => {
    if (commitMessage) {
      await gitService.commit(commitMessage);
      setCommitMessage('');
      updateGitInfo();
    }
  };

  const handlePush = async () => {
    await gitService.push();
    updateGitInfo();
  };

  const handlePull = async () => {
    await gitService.pull();
    updateGitInfo();
  };

  const handleCreateBranch = async () => {
    if (newBranchName) {
      await gitService.createBranch(newBranchName);
      setNewBranchName('');
      updateGitInfo();
    }
  };

  const handleSwitchBranch = async (branchName: string) => {
    await gitService.switchBranch(branchName);
    updateGitInfo();
  };

  const handleStash = async () => {
    await gitService.stash();
    updateGitInfo();
  };

  const handleStashPop = async () => {
    await gitService.stashPop();
    updateGitInfo();
  };

  const handleMerge = async (branchName: string) => {
    await gitService.merge(branchName);
    updateGitInfo();
  };

  return (
    <div className="git-panel">
      <h2>Git Status</h2>
      {status && (
        <div>
          <h3>Current Branch: {currentBranch}</h3>
          <h3>Modified Files:</h3>
          <ul>
            {status.modified.map((file) => (
              <li key={file}>
                {file} <button onClick={() => handleStage(file)}>Stage</button>
              </li>
            ))}
          </ul>
          <h3>Staged Files:</h3>
          <ul>
            {status.staged.map((file) => (
              <li key={file}>{file}</li>
            ))}
          </ul>
        </div>
      )}
      <div>
        <input
          type="text"
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          placeholder="Commit message"
        />
        <button onClick={handleCommit}>Commit</button>
      </div>
      <div>
        <button onClick={handlePush}>Push</button>
        <button onClick={handlePull}>Pull</button>
        <button onClick={handleStash}>Stash</button>
        <button onClick={handleStashPop}>Stash Pop</button>
      </div>
      <h3>Branches</h3>
      {branches && (
        <ul>
          {Object.keys(branches.branches).map((branchName) => (
            <li key={branchName}>
              {branchName}
              {branchName !== currentBranch && (
                <>
                  <button onClick={() => handleSwitchBranch(branchName)}>Switch</button>
                  <button onClick={() => handleMerge(branchName)}>Merge</button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
      <div>
        <input
          type="text"
          value={newBranchName}
          onChange={(e) => setNewBranchName(e.target.value)}
          placeholder="New branch name"
        />
        <button onClick={handleCreateBranch}>Create Branch</button>
      </div>
      <h3>Commit History</h3>
      {commitHistory && (
        <ul>
          {commitHistory.all.slice(0, 5).map((commit) => (
            <li key={commit.hash}>
              {commit.hash.slice(0, 7)} - {commit.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GitPanel;