import { AdvancedCodeRefactoringAssistant } from './AdvancedCodeRefactoringAssistant';
import { Project, SourceFile, Node, SyntaxKind, VariableDeclarationKind, PropertyAccessExpression, Identifier } from 'ts-morph';

interface OptimizationSuggestion {
    type: string;
    description: string;
    impact: number;
    apply: (sourceFile: SourceFile) => void;
}

export class PerformanceOptimization {
    private project: Project;

    constructor(private assistant: AdvancedCodeRefactoringAssistant) {
        this.project = new Project();
    }

    async estimatePerformanceImpact(params: { before: string; after: string; language: string }): Promise<any> {
        const { before, after, language } = params;
        try {
            const beforeAnalysis = await this.assistant.analyzeCode({ filePath: before, language });
            const afterAnalysis = await this.assistant.analyzeCode({ filePath: after, language });

            const complexityImprovement = (beforeAnalysis.complexity - afterAnalysis.complexity) / beforeAnalysis.complexity;
            const lintingIssuesReduction = (beforeAnalysis.lintResults.length - afterAnalysis.lintResults.length) / beforeAnalysis.lintResults.length;

            return {
                complexityImprovement: complexityImprovement * 100,
                lintingIssuesReduction: lintingIssuesReduction * 100,
                estimatedSpeedImprovement: complexityImprovement * 10, // This is a simplified estimation
            };
        } catch (error) {
            console.error(`Error estimating performance impact: ${error}`);
            throw error;
        }
    }

    async optimizePerformance(params: { filePath: string; language: string }): Promise<any> {
        const { filePath, language } = params;
        try {
            const analysis = await this.assistant.analyzeCode({ filePath, language });
            const code = await this.assistant.readFile(filePath);
            const sourceFile = this.parseCode(code, language);
            const optimizations = this.suggestPerformanceOptimizations(analysis, sourceFile);
            const optimizedCode = await this.applyOptimizations(sourceFile, optimizations);
            await this.assistant.writeFile(filePath, optimizedCode);

            return { success: true, message: 'Performance optimizations applied', optimizations };
        } catch (error) {
            console.error(`Error optimizing performance: ${error}`);
            throw error;
        }
    }

    private parseCode(code: string, language: string): SourceFile {
        const fileName = `temp.${language === 'javascript' ? 'js' : 'ts'}`;
        return this.project.createSourceFile(fileName, code, { overwrite: true });
    }

    private suggestPerformanceOptimizations(analysis: any, sourceFile: SourceFile): OptimizationSuggestion[] {
        const suggestions: OptimizationSuggestion[] = [];

        // Example: Suggest using const for variables that are never reassigned
        sourceFile.getVariableDeclarations().forEach(varDecl => {
            const varStatement = varDecl.getParent()?.getParent();
            if (Node.isVariableStatement(varStatement) && 
                varStatement.getDeclarationKind() === VariableDeclarationKind.Let && 
                !this.isReassigned(varDecl)) {
                suggestions.push({
                    type: 'Use Const',
                    description: `Change 'let' to 'const' for the variable "${varDecl.getName()}" as it's never reassigned`,
                    impact: 0.2,
                    apply: (sf: SourceFile) => this.changeLetToConst(sf, varStatement)
                });
            }
        });

        // Example: Suggest using Array.includes instead of indexOf for existence checks
        sourceFile.getDescendantsOfKind(SyntaxKind.BinaryExpression).forEach(binaryExpr => {
            if (binaryExpr.getOperatorToken().getText() === '!==' && binaryExpr.getRight().getText() === '-1') {
                const left = binaryExpr.getLeft();
                if (Node.isCallExpression(left)) {
                    const expression = left.getExpression();
                    if (Node.isPropertyAccessExpression(expression) && expression.getName() === 'indexOf') {
                        suggestions.push({
                            type: 'Use Array.includes',
                            description: `Replace indexOf !== -1 with Array.includes for better readability and slight performance improvement`,
                            impact: 0.3,
                            apply: (sf: SourceFile) => this.replaceIndexOfWithIncludes(sf, binaryExpr)
                        });
                    }
                }
            }
        });

        // Add more performance optimization suggestions based on the analysis

        return suggestions;
    }

    private async applyOptimizations(sourceFile: SourceFile, optimizations: OptimizationSuggestion[]): Promise<string> {
        optimizations.forEach(optimization => optimization.apply(sourceFile));
        return sourceFile.getFullText();
    }

    private isReassigned(varDecl: Node): boolean {
        if (Node.isVariableDeclaration(varDecl)) {
            const varName = varDecl.getName();
            const parent = varDecl.getParent();
            if (parent) {
                const block = parent.getParent();
                if (Node.isBlock(block)) {
                    const assignments = block.getDescendantsOfKind(SyntaxKind.BinaryExpression)
                        .filter(be => be.getOperatorToken().getText() === '=' &&
                                      Node.isIdentifier(be.getLeft()) &&
                                      (be.getLeft() as Identifier).getText() === varName);
                    return assignments.length > 0;
                }
            }
        }
        return false;
    }

    private changeLetToConst(sourceFile: SourceFile, varStatement: Node): void {
        if (Node.isVariableStatement(varStatement)) {
            varStatement.setDeclarationKind(VariableDeclarationKind.Const);
        }
    }

    private replaceIndexOfWithIncludes(sourceFile: SourceFile, binaryExpr: Node): void {
        if (Node.isBinaryExpression(binaryExpr)) {
            const left = binaryExpr.getLeft();
            if (Node.isCallExpression(left)) {
                const expression = left.getExpression();
                if (Node.isPropertyAccessExpression(expression)) {
                    const args = left.getArguments();
                    const arrayExpr = expression.getExpression();
                    binaryExpr.replaceWithText(`${arrayExpr.getText()}.includes(${args[0].getText()})`);
                }
            }
        }
    }
}