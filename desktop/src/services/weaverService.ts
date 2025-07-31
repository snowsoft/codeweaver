// src/services/weaverService.ts
interface WeaverCommand {
    command: string;
    description: string;
    options?: string[];
    examples?: string[];
}

export const weaverCommands: WeaverCommand[] = [
    {
        command: 'new',
        description: 'Sıfırdan yeni kod dosyaları oluşturur',
        options: ['--task', '--context-file'],
        examples: [
            'weaver new user_service.py --task "Create user service with CRUD operations"',
            'weaver new Button.tsx --task "Create reusable button component" --context-file theme.ts'
        ]
    },
    {
        command: 'refactor',
        description: 'Mevcut kodu modernize eder ve iyileştirir',
        options: ['--task', '--context-dir'],
        examples: [
            'weaver refactor old_code.js --task "Add TypeScript types and modern syntax"',
            'weaver refactor api.py --task "Add async/await support" --context-dir src/'
        ]
    },
    {
        command: 'document',
        description: 'Kod dosyalarına otomatik dokümantasyon ekler',
        options: ['--style'],
        examples: [
            'weaver document utils.js --style jsdoc',
            'weaver document helpers.py --style google'
        ]
    },
    {
        command: 'test',
        description: 'Kod için otomatik test dosyaları oluşturur',
        options: ['--framework'],
        examples: [
            'weaver test calculator.py --framework pytest',
            'weaver test api.js --framework jest'
        ]
    },
    {
        command: 'review',
        description: 'Güvenlik, performans ve kalite açısından kod analizi yapar',
        options: ['--task'],
        examples: [
            'weaver review auth.php --task "Check for security vulnerabilities"',
            'weaver review algorithm.py --task "Analyze time complexity"'
        ]
    },
    {
        command: 'heal-project',
        description: 'Tüm kod tabanını analiz ederek sorunları tespit eder',
        options: ['--auto-fix', '--severity'],
        examples: ['weaver heal-project --auto-fix']
    },
    {
        command: 'template',
        description: 'Hazır proje şablonları ile çalışır',
        options: ['list', 'use', 'save', 'info'],
        examples: [
            'weaver template list',
            'weaver template use react-app my-project'
        ]
    }
];

export class WeaverService {
    static async executeCommand(command: string, args: string[]): Promise<string> {
        // Electron IPC ile gerçek Weaver CLI'ya bağlanacak
        if (window.electron?.weaverExecute) {
            return await window.electron.weaverExecute(command, args);
        }

        // Demo mode
        return `Executing: weaver ${command} ${args.join(' ')}\n✓ Command would be executed in production`;
    }

    static getCommandHelp(command: string): string {
        const cmd = weaverCommands.find(c => c.command === command);
        if (!cmd) return 'Command not found';

        let help = `${cmd.description}\n\n`;
        if (cmd.options) {
            help += `Options: ${cmd.options.join(', ')}\n\n`;
        }
        if (cmd.examples) {
            help += 'Examples:\n';
            cmd.examples.forEach(ex => {
                help += `  ${ex}\n`;
            });
        }
        return help;
    }
}