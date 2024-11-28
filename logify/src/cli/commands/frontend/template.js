// logify JSON to HTML –– Modify for customization!
const createChangelogTemplate = (repositoryName, changelogData) => {
    let html = `<head>
    <link rel="stylesheet" type="text/css" href="/logify.css">
</head>
<div class="changelog">
    <h1 class="repository-name">${repositoryName}</h1>
    <p class="changelogs-generated">Changelogs generated by <a href="https://github.com/danielparkdp/Change-Logify">Logify</a>!</p>
    `;
    
    changelogData.changelogs.reverse().forEach(changelog => {
        html += `
            <div class="changelog-entry">
                <h2 class="changelog-version">Version: ${changelog.version}</h2>
                <p class="changelog-timestamp"><strong>Released on:</strong> ${new Date(changelog.timestamp).toLocaleString()}</p>
                <div class="changelog-log">
                    <p class="changelog-title">${changelog.log.split('\n')[0]}</p>
                    <ul>
                        ${changelog.log.split('\n').slice(1)
                            .filter(line => line.trim() !== '')
                            .map(line => `<li>${line.replace(/[^a-zA-Z0-9\s]/g, '').trim()}</li>`)
                            .join('')}
                    </ul>
                </div>
            </div>
        `;
    });

    html += '</div>';
    return html;
}

module.exports = createChangelogTemplate;
