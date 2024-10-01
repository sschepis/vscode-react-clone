import simpleGit, { SimpleGit, StatusResult, BranchSummary, LogResult } from 'simple-git';

class GitService {
  private git: SimpleGit;

  constructor() {
    this.git = simpleGit();
  }

  async init(path: string): Promise<void> {
    await this.git.cwd(path);
    await this.git.init();
  }

  async getStatus(): Promise<StatusResult> {
    return await this.git.status();
  }

  async add(files: string | string[]): Promise<void> {
    await this.git.add(files);
  }

  async commit(message: string): Promise<void> {
    await this.git.commit(message);
  }

  async push(remote: string = 'origin', branch: string = 'main'): Promise<void> {
    await this.git.push(remote, branch);
  }

  async pull(remote: string = 'origin', branch: string = 'main'): Promise<void> {
    await this.git.pull(remote, branch);
  }

  async createBranch(branchName: string): Promise<void> {
    await this.git.checkoutLocalBranch(branchName);
  }

  async switchBranch(branchName: string): Promise<void> {
    await this.git.checkout(branchName);
  }

  async getBranches(): Promise<BranchSummary> {
    return await this.git.branch();
  }

  async getCommitHistory(maxCount: number = 10): Promise<LogResult> {
    return await this.git.log({ maxCount });
  }

  async getDiff(file?: string): Promise<string> {
    return file ? await this.git.diff([file]) : await this.git.diff();
  }

  async stash(): Promise<void> {
    await this.git.stash(['push']);
  }

  async stashPop(): Promise<void> {
    await this.git.stash(['pop']);
  }

  async merge(branchName: string): Promise<void> {
    await this.git.merge([branchName]);
  }
}

export const gitService = new GitService();