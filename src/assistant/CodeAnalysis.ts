import { AdvancedCodeRefactoringAssistant } from './AdvancedCodeRefactoringAssistant';
import { Project, SourceFile, Node, SyntaxKind } from 'ts-morph';
import { Linter, Rule } from 'eslint';
import * as path from 'path';

export class CodeAnalysis {
    private project: Project;
    private linter: Linter;

    constructor(private assistant: AdvancedCodeRefactoringAssistant) {
        this.project = new Project();
        this.linter = new Linter();
    }

    async analyzeCode(params: { filePath: string; language: string }): Promise<any> {
        const { filePath, language } = params;
        try {
            const code = await this.assistant.readFile(filePath);
            const ast = this.parseCode(code, language);
            const lintResults = await this.lintCode(code, language, filePath);
            const complexity = this.calculateComplexity(ast);
            const dependencies = this.analyzeDependencies(ast);
            const codeMetrics = this.calculateCodeMetrics(code);

            return {
                ast,
                lintResults,
                complexity,
                dependencies,
                codeMetrics
            };
        } catch (error) {
            console.error(`Error analyzing code: ${error}`);
            throw error;
        }
    }

    private parseCode(code: string, language: string): SourceFile {
        const fileName = `temp.${language === 'javascript' ? 'js' : 'ts'}`;
        return this.project.createSourceFile(fileName, code, { overwrite: true });
    }

    private async lintCode(code: string, language: string, filePath: string): Promise<Linter.LintMessage[]> {
        const config = await this.getLinterConfig(language);
        return this.linter.verify(code, config, { filename: path.basename(filePath) });
    }

    private async getLinterConfig(language: string): Promise<Linter.Config<Linter.RulesRecord>> {
        // TODO: Implement proper config loading based on language
        return {
            rules: {
                'no-unused-vars': 'warn',
                'no-console': 'warn',
            },
        };
    }

    private calculateComplexity(ast: SourceFile): number {
        let complexity = 1;

        function increaseComplexity() {
            complexity++;
        }

        ast.forEachDescendant((node) => {
            switch (node.getKind()) {
                case SyntaxKind.IfStatement:
                case SyntaxKind.ForStatement:
                case SyntaxKind.WhileStatement:
                case SyntaxKind.DoStatement:
                case SyntaxKind.CatchClause:
                case SyntaxKind.ConditionalExpression:
                case SyntaxKind.SwitchStatement:
                    increaseComplexity();
                    break;
                case SyntaxKind.BinaryExpression:
                    if (['&&', '||'].includes(node.getText())) {
                        increaseComplexity();
                    }
                    break;
            }
        });

        return complexity;
    }

    private analyzeDependencies(ast: SourceFile): string[] {
        const dependencies: string[] = [];

        ast.getImportDeclarations().forEach((importDecl) => {
            const moduleSpecifier = importDecl.getModuleSpecifierValue();
            if (!moduleSpecifier.startsWith('.')) {
                dependencies.push(moduleSpecifier);
            }
        });

        return dependencies;
    }

    private calculateCodeMetrics(code: string): any {
        const lines = code.split('\n');
        return {
            totalLines: lines.length,
            nonEmptyLines: lines.filter(line => line.trim().length > 0).length,
            commentLines: lines.filter(line => line.trim().startsWith('//') || line.trim().startsWith('/*')).length,
        };
    }

    async detectCodeSmells(params: { filePath: string; language: string }): Promise<any> {
        const analysis = await this.analyzeCode(params);
        const codeSmells = this.identifyCodeSmells(analysis);
        return codeSmells;
    }

    private identifyCodeSmells(analysis: any): any[] {
        const codeSmells = [];

        if (analysis.complexity > 10) {
            codeSmells.push({ type: 'High Complexity', description: 'The function is too complex and should be refactored.' });
        }

        if (analysis.codeMetrics.totalLines > 100) {
            codeSmells.push({ type: 'Long File', description: 'The file is too long and should be split into smaller modules.' });
        }

        analysis.lintResults.forEach((result: Linter.LintMessage) => {
            codeSmells.push({ type: 'Linting Issue', description: result.message });
        });

        // Add more code smell detection logic here

        return codeSmells;
    }
}