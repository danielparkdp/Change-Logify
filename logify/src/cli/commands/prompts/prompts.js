function summarize_short(input) {
    return `For the following git log, summarize all changes contained in it that might be important to a user in a one-liner, then summarize all changes in bullet points: ${input}
    Your output should be in the format:
    Title

    - summarized change 1
    - summarized change 2
    ...`;
}

module.exports = { summarize_short };
