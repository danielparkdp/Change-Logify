// logify JSON to HTML –– Modify for customization!
const createChangelogTemplate = (changelogData) => {
    let html = '<div class="changelog">';
    
    changelogData.changelogs.reverse().forEach(changelog => {
        html += `
            <div class="changelog-entry">
                <h2>Version: ${changelog.version}</h2>
                <p><strong>Timestamp:</strong> ${new Date(changelog.timestamp).toLocaleString()}</p>
                <p><strong>Commits:</strong> ${changelog.commits.join(', ')}</p>
                <p><strong>Log:</strong></p>
                <pre>${changelog.log}</pre>
            </div>
        `;
    });

    html += '</div>';
    return html;
}

module.exports = createChangelogTemplate;

