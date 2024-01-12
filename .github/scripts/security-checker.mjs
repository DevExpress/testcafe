const STATES = {
    open:   'open',
    closed: 'closed',
};

const LABELS = {
    dependabot: 'dependabot',
    codeq:      'codeql',
    security:   'security notification',
};

const ALERT_TYPES = {
    dependabot: 'dependabot',
    codeq:      'codeql',
}

const UPDATE_TYPE = {
    addAlertToIssue: 'addAlertToIssue',
    closeTask:       'closeTask'
}

class SecurityChecker {
    constructor(github, context, issueRepo) {
        this.github    = github;
        this.issueRepo = issueRepo;
        this.context   = {
            owner: context.repo.owner,
            repo:  context.repo.repo,
        };
    }

    async check() {
        const dependabotAlerts = await this.getDependabotAlerts();
        const codeqlAlerts     = await this.getCodeqlAlerts();
        const existedIssues    = await this.getExistedIssues();

        this.alertDictionary = this.createAlertDictionary(existedIssues);

        await this.closeSpoiledIssues();
        await this.createDependabotlIssues(dependabotAlerts);
        await this.createCodeqlIssues(codeqlAlerts);
    }

    async getDependabotAlerts() {
        const { data } = await this.github.rest.dependabot.listAlertsForRepo({ state: STATES.open, ...this.context });

        return data;
    }

    async getCodeqlAlerts() {
        try {
            const { data } = await this.github.rest.codeScanning.listAlertsForRepo({ state: STATES.open, ...this.context });

            return data;
        }
        catch (e) {
            if (e.message.includes('no analysis found') || e.message.includes('Advanced Security must be enabled for this repository to use code scanning'))
                return [];

            throw e;
        }
    }

    async getExistedIssues() {
        const { data: existedIssues } = await this.github.rest.issues.listForRepo({
            owner:  this.context.owner,
            repo:   this.issueRepo,
            labels: [LABELS.security],
            state:  STATES.open,
        });

        return existedIssues;
    }

    createAlertDictionary(existedIssues) {
        return existedIssues.reduce((res, issue) => {
            const [, url, type] = issue.body.match(/(https:.*\/(dependabot|code-scanning)\/(\d+))/);

            if (!url)
                return res;

            if (type === ALERT_TYPES.dependabot) {
                const [, cveId]  = issue.body.match(/CVE ID:\s*`(.*)`/);
                const [, ghsaId] = issue.body.match(/GHSA ID:\s*`(.*)`/);

                res.set(issue.title, { issue, type, cveId, ghsaId });
            }
            else
                res.set(issue.title, { issue, type })


            return res;
        }, new Map());
    }

    async closeSpoiledIssues() {
        const regExpAlertNumber = new RegExp(`(?<=\`${this.context.repo}\` - https:.*/dependabot/)\\d+`);
        for (const alert of this.alertDictionary.values()) {

            if (alert.type === ALERT_TYPES.dependabot) {
                const alertNumber  = alert.issue.body.match(regExpAlertNumber);

                if (!alertNumber)
                    continue;

                const isAlertOpened = await this.isDependabotAlertOpened(alertNumber);

                if (isAlertOpened)
                    continue;

                await this.updateIssue(alert, UPDATE_TYPE.closeTask);
            }
        }
    }

    async isDependabotAlertOpened(alertNumber) {
        const alert = await this.getDependabotAlertInfo(alertNumber);

        return alert.state === STATES.open;
    }

    async getDependabotAlertInfo(alertNumber) {
        try {
            const { data } = await this.github.rest.dependabot.getAlert({ alert_number: alertNumber, ...this.context });

            return data;
        }
        catch (e) {
            if (e.message.includes('No alert found for alert number'))
                return {};

            throw e;
        }
    }

    async updateIssue(alert, type) {
        const updates = {};

        if (type === UPDATE_TYPE.addAlertToIssue) {
            const { issue } = this.alertDictionary.get(alert.security_advisory.summary);

            updates.issue_number = issue.number;
            updates.body         = issue.body.replace(/(?<=Repositories:)[\s\S]*?(?=####|$)/g, (match) => {
                return match + `- [ ] \`${this.context.repo}\` - ${alert.html_url}\n`;
            });
        }

        if (type === UPDATE_TYPE.closeTask) {
            updates.body         = alert.issue.body.replace(new RegExp(`\\[ \\](?= \`${this.context.repo}\`)`), '[x]');
            updates.state        = !updates.body.match(/\[ \]/) ? STATES.closed : STATES.open;
            updates.issue_number = alert.issue.number;
        }

        return this.github.rest.issues.update({
            owner: this.context.owner,
            repo:  this.issueRepo,
            ...updates,
        });
    }


    async createDependabotlIssues(dependabotAlerts) {
        for (const alert of dependabotAlerts) {
            if (this.needAddAlertToIssue(alert)) {
                await this.updateIssue(alert, UPDATE_TYPE.addAlertToIssue);
            }
            else if (this.needCreateIssue(alert)) {
                await this.createIssue({
                    labels:       [LABELS.dependabot, LABELS.security, alert.dependency.scope],
                    originRepo:   this.context.repo,
                    summary:      alert.security_advisory.summary,
                    description:  alert.security_advisory.description,
                    link:         alert.html_url,
                    issuePackage: alert.dependency.package.name,
                    cveId:        alert.security_advisory.cve_id,
                    ghsaId:       alert.security_advisory.ghsa_id,
                });
            }
        }
    }

    needAddAlertToIssue(alert) {
        const existedIssue = this.alertDictionary.get(alert.security_advisory.summary);

        return existedIssue
            && existedIssue.cveId === alert.security_advisory.cve_id
            && existedIssue.ghsaId === alert.security_advisory.ghsa_id
            && !existedIssue.issue.body.includes(`\`${this.context.repo}\``);
    }

    async createCodeqlIssues(codeqlAlerts) {
        for (const alert of codeqlAlerts) {
            if (!this.needCreateIssue(alert, false))
                continue;

            await this.createIssue({
                labels:      [LABELS.codeql, LABELS.security],
                originRepo:  this.context.repo,
                summary:     alert.rule.description,
                description: alert.most_recent_instance.message.text,
                link:        alert.html_url,
            }, false);
        }
    }

    needCreateIssue(alert, isDependabotAlert = true) {
        const dictionaryKey = isDependabotAlert ? alert.security_advisory.summary : `[${this.context.repo}] ${alert.rule.description}`;

        return !this.alertDictionary.get(dictionaryKey) && Date.now() - new Date(alert.created_at) <= 1000 * 60 * 60 * 24;
    }

    async createIssue({ labels, originRepo, summary, description, link, issuePackage = '', cveId, ghsaId }, isDependabotAlert = true) {
        const title = isDependabotAlert ? `${summary}` : `[${originRepo}] ${summary}`;
        let body = ''
            + `#### Repositories:\n`
            + `- [ ] \`${originRepo}\` - ${link}\n`
            + (issuePackage ? `#### Package: \`${issuePackage}\`\n` : '')
            + `#### Description:\n`
            + `${description}\n`;

        if (isDependabotAlert)
            body += `\n#### CVE ID: \`${cveId}\`\n#### GHSA ID: \`${ghsaId}\``;

        return this.github.rest.issues.create({
            title, body, labels,
            owner: this.context.owner,
            repo:  this.issueRepo,
        });
    }
}

export default SecurityChecker;
