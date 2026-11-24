import json, sys, re
from html.parser import HTMLParser
class Text(HTMLParser):
    def __init__(self):
        super().__init__(); self.parts=[]; self.links=[]; self.skip=0
    def handle_starttag(self,tag,attrs):
        if tag in ('script','style'): self.skip+=1; return
        if self.skip:return
        a=dict(attrs)
        if tag in ('p','div','ul','ol','blockquote'): self.parts.append('\n\n')
        if tag=='br': self.parts.append('\n')
        if tag in ('h1','h2','h3','h4'): self.parts.append('\n\n'+('## ' if tag in ('h1','h2') else '### '))
        if tag=='li': self.parts.append('\n- ')
        if tag in ('b','strong'):self.parts.append('**')
        if tag=='a':
            href=a.get('href',''); safe=href.startswith('https://') or (href.startswith('/') and not href.startswith('//'))
            self.links.append(href if safe else ''); self.parts.append('[' if safe else '')
    def handle_endtag(self,tag):
        if tag in ('script','style'):self.skip=max(0,self.skip-1);return
        if self.skip:return
        if tag in ('p','div','h1','h2','h3','h4','ul','ol','blockquote'):self.parts.append('\n\n')
        if tag in ('b','strong'):self.parts.append('**')
        if tag=='a' and self.links:
            href=self.links.pop()
            if href:self.parts.append(']('+href+')')
    def handle_data(self,data):
        if not self.skip:self.parts.append(data)
items=json.load(sys.stdin)
for a in items:
    for b in a['blocks']:
        parser=Text();parser.feed(b.get('text',''));b['text']=re.sub(r'\n{3,}','\n\n',''.join(parser.parts)).strip()
json.dump(items,sys.stdout,ensure_ascii=False)
