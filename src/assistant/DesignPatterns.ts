import { AdvancedCodeRefactoringAssistant } from './AdvancedCodeRefactoringAssistant';
import { Project, SourceFile, Node, SyntaxKind, ClassDeclaration, MethodDeclaration, Scope } from 'ts-morph';

export class DesignPatterns {
    private project: Project;

    constructor(private assistant: AdvancedCodeRefactoringAssistant) {
        this.project = new Project();
    }

    async applyDesignPattern(params: { filePath: string; pattern: string; options?: any }): Promise<any> {
        const { filePath, pattern, options } = params;
        try {
            const code = await this.assistant.readFile(filePath);
            const sourceFile = this.parseCode(code);

            let modifiedAst: SourceFile;
            switch (pattern.toLowerCase()) {
                case 'singleton':
                    modifiedAst = this.applySingletonPattern(sourceFile, options);
                    break;
                case 'factory':
                    modifiedAst = this.applyFactoryPattern(sourceFile, options);
                    break;
                case 'observer':
                    modifiedAst = this.applyObserverPattern(sourceFile, options);
                    break;
                case 'strategy':
                    modifiedAst = this.applyStrategyPattern(sourceFile, options);
                    break;
                default:
                    throw new Error(`Unsupported design pattern: ${pattern}`);
            }

            const modifiedCode = modifiedAst.getFullText();
            await this.assistant.writeFile(filePath, modifiedCode);

            return { success: true, message: `Successfully applied ${pattern} pattern` };
        } catch (error) {
            console.error(`Error applying design pattern: ${error}`);
            throw error;
        }
    }

    private parseCode(code: string): SourceFile {
        return this.project.createSourceFile('temp.ts', code, { overwrite: true });
    }

    private applySingletonPattern(sourceFile: SourceFile, options?: any): SourceFile {
        const className = options?.className || 'Singleton';
        
        const singletonClass = sourceFile.addClass({
            name: className,
            isExported: true,
        });

        singletonClass.addProperty({
            name: 'instance',
            type: className,
            isStatic: true,
            isReadonly: true,
            scope: Scope.Private,
        });

        singletonClass.addMethod({
            name: 'getInstance',
            isStatic: true,
            returnType: className,
            statements: [
                `if (!${className}.instance) {`,
                `    ${className}.instance = new ${className}();`,
                `}`,
                `return ${className}.instance;`
            ]
        });

        singletonClass.addConstructor({
            scope: Scope.Private,
        });

        return sourceFile;
    }

    private applyFactoryPattern(sourceFile: SourceFile, options?: any): SourceFile {
        const interfaceName = options?.interfaceName || 'Product';
        const factoryName = options?.factoryName || 'Factory';
        
        sourceFile.addInterface({
            name: interfaceName,
            isExported: true,
            methods: [{ name: 'operation', returnType: 'void' }]
        });

        const factoryClass = sourceFile.addClass({
            name: factoryName,
            isExported: true,
        });

        factoryClass.addMethod({
            name: 'createProduct',
            parameters: [{ name: 'type', type: 'string' }],
            returnType: interfaceName,
            statements: [
                `switch (type) {`,
                `    case 'A':`,
                `        return new ConcreteProductA();`,
                `    case 'B':`,
                `        return new ConcreteProductB();`,
                `    default:`,
                `        throw new Error('Invalid product type');`,
                `}`
            ]
        });

        sourceFile.addClass({
            name: 'ConcreteProductA',
            implements: [interfaceName],
            methods: [
                {
                    name: 'operation',
                    statements: 'console.log("ConcreteProductA operation");'
                }
            ]
        });

        sourceFile.addClass({
            name: 'ConcreteProductB',
            implements: [interfaceName],
            methods: [
                {
                    name: 'operation',
                    statements: 'console.log("ConcreteProductB operation");'
                }
            ]
        });

        return sourceFile;
    }

    private applyObserverPattern(sourceFile: SourceFile, options?: any): SourceFile {
        const subjectName = options?.subjectName || 'Subject';
        const observerName = options?.observerName || 'Observer';

        sourceFile.addInterface({
            name: observerName,
            isExported: true,
            methods: [{ name: 'update', parameters: [{ name: 'data', type: 'any' }] }]
        });

        const subjectClass = sourceFile.addClass({
            name: subjectName,
            isExported: true,
        });

        subjectClass.addProperty({
            name: 'observers',
            type: `${observerName}[]`,
            initializer: '[]'
        });

        subjectClass.addMethod({
            name: 'addObserver',
            parameters: [{ name: 'observer', type: observerName }],
            statements: 'this.observers.push(observer);'
        });

        subjectClass.addMethod({
            name: 'removeObserver',
            parameters: [{ name: 'observer', type: observerName }],
            statements: 'this.observers = this.observers.filter(obs => obs !== observer);'
        });

        subjectClass.addMethod({
            name: 'notify',
            parameters: [{ name: 'data', type: 'any' }],
            statements: 'this.observers.forEach(observer => observer.update(data));'
        });

        return sourceFile;
    }

    private applyStrategyPattern(sourceFile: SourceFile, options?: any): SourceFile {
        const strategyName = options?.strategyName || 'Strategy';
        const contextName = options?.contextName || 'Context';

        sourceFile.addInterface({
            name: strategyName,
            isExported: true,
            methods: [{ name: 'execute', parameters: [{ name: 'data', type: 'any' }] }]
        });

        const contextClass = sourceFile.addClass({
            name: contextName,
            isExported: true,
        });

        contextClass.addProperty({
            name: 'strategy',
            type: strategyName,
        });

        contextClass.addMethod({
            name: 'setStrategy',
            parameters: [{ name: 'strategy', type: strategyName }],
            statements: 'this.strategy = strategy;'
        });

        contextClass.addMethod({
            name: 'executeStrategy',
            parameters: [{ name: 'data', type: 'any' }],
            statements: 'return this.strategy.execute(data);'
        });

        return sourceFile;
    }
}