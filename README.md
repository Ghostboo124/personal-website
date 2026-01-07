# Personal Website

This is my personal website, located at [personal.apcoding.com.au](https://personal.apcoding.com.au) and is hosted through Vercel

This git repository is hosted on two places

- [Codeberg](https://codeberg.org/Ghostboo124/personal-website) for the actual repository that is commited to, and
- [GitHub](https://github.com/Ghostboo124/personal-website) as a push mirror for Vercel deployments and Coderabbit PR reviews.

## Development process

Firstly, fork the repo on Codeberg, then clone your copy of the repo with

```bash
git clone <http or ssh url to your codeberg repo>
```

Then create a new branch using

```bash
git switch -c main <new-branch-name>
```

Then install dependencies with

```bash
bun install
```

And finally, run the development server:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The server is hot reloaded when you make changes.

## Commits

### Changes to main

Directly commiting to main is strictly **prohibited** and all changes must go through pull requests, please open a PR on both Codeberg and GitHub and it will be reviewed, before being merged into main.

### Commit Messages

To maintain a readable git history, from this documentation commit forwards, I will be using [Conventional Commits 1.0.0-beta.4](https://www.conventionalcommits.org/en/v1.0.0-beta.4) for git commit messages

All commit messages should be in lower case and formatted as follows:

```txt
<type>[optional scope]: <description>

[optional body]

[optional footer]
```

where \<type\> can be one of the following, and if it is a breaking change, append a `!` to the type

- chore
- docs
- feat
- fix
- improvement
- style
- refactor

[optional scope] can describe a part of the code (e.g. home for the home page (/), or login for the login system)

\<description\> should be a brief description of what you changed, please try to limit each commit to only one change where possible.

[optional body] can be used to provide a more detailed explanation of the commit. If the commit contains a breaking change, add to the start of the line `BREAKING CHANGE:`

[optional footer] should be used if the \<type\> is fix, and should contain the issue number in the format `closes issue #<issue number>`. Please use Codeberg issue numbers (though the GitHub should be the same)
