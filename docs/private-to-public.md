# Private vault → public site

The private knowledge base (Obsidian / Personal OS / Career OS) is the source of truth for notes and drafts. This repository only receives content that was explicitly selected, cleaned and approved. There is no automatic or two-way sync.

```text
private vault note (explicitly selected)
  → private staging copy
  → checks: secrets, personal data, private links, licenses
  → human review and approval
  → copy approved text into src/content/<collection>/<locale>/<id>.md
  → pull request → CI (preview + production builds)
  → merge → GitHub Pages
```

## Never copy into this repository

- unapproved drafts (even with `status: draft` — the file itself becomes public)
- job postings, company-specific application strategy, interview notes
- diaries, finances, health
- tokens, emails, phone numbers, internal paths, private repository names
- screenshots that show any of the above

## Mapping a vault note to site Markdown

| Vault | Site |
| --- | --- |
| file name / note ID | `id` (lowercase, hyphenated) |
| `aliases`, language links | `translationKey` (same for every language version) |
| `tags` property | `tags` (lowercase, hyphenated) |
| note revision / last commit of the vault | `sourceRevision` |
| `[[wikilink]]` | normal Markdown link to a public URL, or remove |
| `![[attachment.png]]` | copy the image into `public/images/<id>/` only if approved; use `![alt](/images/<id>/file.png)` |
| `%% comment %%` | remove |
| callouts `> [!note]` | plain blockquote |

`scripts/validate-content.ts` rejects wikilinks, embeds, Obsidian comments, email addresses, local filesystem paths and token-looking strings, so a forgotten conversion fails CI.

## Future export CLI (not built yet)

Once the vault location and policy are fixed, a small CLI in the private Career OS repository (Python + uv) can automate the staging step:

1. read a list of explicitly approved note IDs (allow-list, not a folder glob)
2. convert wikilinks/embeds/callouts per the table above
3. run the same checks as `validate-content.ts`
4. write to a staging folder and print a diff for review

It must never write directly into this repository or push. Copying into this repository stays a manual, reviewed step.

## Zenn

Japanese posts may also be published on Zenn. Keep the site as the original, add `zennUrl` to the post's frontmatter after an approved manual publication, and check Zenn's guidelines on duplicate content before posting. No automatic posting.
