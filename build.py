"""Builds dist/index.html from src/. Run: python3 build.py"""
import os
R=os.path.dirname(os.path.abspath(__file__));S=os.path.join(R,'src')
rd=lambda n:open(os.path.join(S,n),encoding='utf-8').read()
css=rd('orig.css')+rd('platform.css')
order=['intake.js','ailments.js','catalogue.js','platform1.js','platform2.js','platform3.js','platform4.js']
scripts="\n".join(rd(n) for n in order)+"\nNC.render();\n"
html=f'<!DOCTYPE html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><title>Nidana Care – clickable prototype</title>\n<style>{css}</style></head><body><div class="wrap" id="root"></div><div id="toast" role="status"></div>\n<script>\n{scripts}</script></body></html>'
os.makedirs(os.path.join(R,'dist'),exist_ok=True)
open(os.path.join(R,'dist','index.html'),'w',encoding='utf-8').write(html);print(len(html))
