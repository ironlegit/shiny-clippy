# Reducktor

Reducktor is a web tool that can be used to redact sensitive information from text, such as emails, or logs. Useful applications include pasting content into an LLM or contacting support.

## Features

- Simple and lightweight HTML page.
- Preserves text formatting when copying from VM to host.
- **Thematic Redactors**: Use thematic redaction options (based on [Compromise](https://github.com/spencermountain/compromise)) to remove sensitive information from your text.
- **Name Redactor**: Use experimental name redaction to remove common first and last names from different regions. The names were selected from the Python [names-dataset](https://pypi.org/project/names-dataset/).
- **Custom Redactor**: Enter custom strings to remove sensitive information from your text.

## Local Testing

From root folder run one of the following to start a local development server:

- `npx serve`
- `python -m http.server 8000`

Open localhost in browser for testing.
