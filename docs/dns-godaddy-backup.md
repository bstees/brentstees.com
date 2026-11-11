# GoDaddy DNS zone snapshot: brentstees.com

Captured 2026-11-11 from the GoDaddy DNS dashboard (18 records), before moving DNS to Cloudflare.
Rollback: set nameservers back to GoDaddy defaults (ns57/ns58.domaincontrol.com); this zone stays intact there.

| Type  | Name           | Data                                         | TTL  |
|-------|----------------|----------------------------------------------|------|
| A     | @              | Parked (GoDaddy parking)                     | 600s |
| NS    | @              | ns57.domaincontrol.com.                      | 1h   |
| NS    | @              | ns58.domaincontrol.com.                      | 1h   |
| SOA   | @              | ns57.domaincontrol.com.                      | 1h   |
| MX    | @              | smtp.secureserver.net. (priority 0)          | 1h   |
| MX    | @              | mailstore1.secureserver.net. (priority 10)   | 1h   |
| CNAME | e              | email.secureserver.net.                      | 1h   |
| CNAME | email          | email.secureserver.net.                      | 1h   |
| CNAME | imap           | imap.secureserver.net.                       | 1h   |
| CNAME | mail           | pop.secureserver.net.                        | 1h   |
| CNAME | mobilemail     | mobilemail-v01.prod.mesa1.secureserver.net.  | 1h   |
| CNAME | pda            | mobilemail-v01.prod.mesa1.secureserver.net.  | 1h   |
| CNAME | pop            | pop.secureserver.net.                        | 1h   |
| CNAME | smtp           | smtp.secureserver.net.                       | 1h   |
| CNAME | webmail        | webmail.secureserver.net.                    | 1h   |
| CNAME | ftp            | brentstees.com.                              | 1h   |
| CNAME | www            | brentstees.com.                              | 1h   |
| CNAME | _domainconnect | _domainconnect.gd.domaincontrol.com.         | 1h   |

No TXT, CAA, SRV, or AAAA records exist.

## Current Cloudflare zone (2026-11-11)
No email is used on this domain, so all GoDaddy mail records were removed and replaced with "sends/receives no mail" records:
- `MX @ 0 .` (null MX, RFC 7505)
- `TXT @ "v=spf1 -all"`
- `TXT _dmarc "v=DMARC1; p=reject; sp=reject; adkim=s; aspf=s"`
- `TXT *._domainkey "v=DKIM1; p="`
- Worker custom domains: `brentstees.com`, `www.brentstees.com` (www 301 → apex)

## Original plan in Cloudflare (superseded)
- Keep (DNS only, unproxied): both MX, and CNAMEs e, email, imap, mail, mobilemail, pda, pop, smtp, webmail.
- Replace: `@` (parked A) and `www` become Worker custom domains for the site.
- Drop: `ftp` (pointed at the parked apex; no FTP host), `_domainconnect` (GoDaddy-only feature), and the NS/SOA records (Cloudflare provides its own).
