import { AdvancedCodeRefactoringAssistant } from './AdvancedCodeRefactoringAssistant';
import { Project, SourceFile, Node, SyntaxKind, VariableDeclaration, PropertyAccessExpression, VariableDeclarationKind } from 'ts-morph';

interface Improvement {
    type: string;
    description: string;
    apply: (sourceFile: SourceFile) => void;
}

export class SelfImprovement {
    private project: Project;

    constructor(private assistant: AdvancedCodeRefactoringAssistant) {
        this.project = new Project();
    }

    async selfImprovement(): Promise<any> {
        try {
            const assistantFiles = await this.getAssistantFiles();
            const improvements: Improvement[] = [];

            for (const filePath of assistantFiles) {
                const code = await this.assistant.readFile(filePath);
                const sourceFile = this.parseCode(code);
                const fileImprovements = this.analyzeSelf(sourceFile);
                improvements.push(...fileImprovements);
            }

            if (improvements.length > 0) {
                for (const filePath of assistantFiles) {
                    const code = await this.assistant.readFile(filePath);
                    const sourceFile = this.parseCode(code);
                    const improvedCode = this.applyImprovements(sourceFile, improvements);
                    await this.assistant.writeFile(filePath, improvedCode);
                }
                return { success: true, message: 'Self-improvement applied', improvements };
            }
            return { success: false, message: 'No self-improvements identified' };
        } catch (error) {
            console.error(`Error in self-improvement: ${error}`);
            throw error;
        }
    }

    private async getAssistantFiles(): Promise<string[]> {
        // This is a placeholder. In a real implementation, you'd need to determine
        // which files are part of the assistant's codebase.
        return [
            'src/assistant/AdvancedCodeRefactoringAssistant.ts',
            'src/assistant/CodeAnalysis.ts',
            'src/assistant/Refactoring.ts',
            'src/assistant/PerformanceOptimization.ts',
            'src/assistant/TestingImprovement.ts',
            'src/assistant/DesignPatterns.ts',
            'src/assistant/SelfImprovement.ts'
        ];
    }

    private parseCode(code: string): SourceFile {
        return this.project.createSourceFile('temp.ts', code, { overwrite: true });
    }

    private analyzeSelf(sourceFile: SourceFile): Improvement[] {
        const improvements: Improvement[] = [];

        // Example: Suggest using const for variables that are never reassigned
        sourceFile.getVariableDeclarations().forEach(varDecl => {
            if (varDecl.getType().isLiteral() && varDecl.getParent()?.getParent()?.getKind() === SyntaxKind.VariableStatement) {
                const varStatement = varDecl.getParent()?.getParent();
                if (varStatement && Node.isVariableStatement(varStatement) && varStatement.getDeclarationKind() !== VariableDeclarationKind.Const) {
                    improvements.push({
                        type: 'Use Const',
                        description: `Change 'let' to 'const' for the variable "${varDecl.getName()}" as it's assigned a literal value and never reassigned`,
                        apply: (sf: SourceFile) => this.changeLetToConst(sf, varStatement)
                    });
                }
            }
        });

        // Example: Suggest using optional chaining for nullable property access
        sourceFile.getDescendantsOfKind(SyntaxKind.PropertyAccessExpression).forEach(propAccess => {
            const expression = propAccess.getExpression();
            if (expression.getType().isNullable()) {
                improvements.push({
                    type: 'Use Optional Chaining',
                    description: `Use optional chaining for potentially null/undefined access on "${expression.getText()}"`,
                    apply: (sf: SourceFile) => this.addOptionalChaining(sf, propAccess)
                });
            }
        });

        // Add more self-improvement suggestions here

        return improvements;
    }

    private applyImprovements(sourceFile: SourceFile, improvements: Improvement[]): string {
        improvements.forEach(improvement => improvement.apply(sourceFile));
        return sourceFile.getFullText();
    }

    private changeLetToConst(sourceFile: SourceFile, varStatement: Node): void {
        if (Node.isVariableStatement(varStatement)) {
            varStatement.setDeclarationKind(VariableDeclarationKind.Const);
        }
    }

    private addOptionalChaining(sourceFile: SourceFile, propAccess: PropertyAccessExpression): void {
        propAccess.replaceWithText(`${propAccess.getExpression().getText()}?.${propAccess.getName()}`);
    }
}