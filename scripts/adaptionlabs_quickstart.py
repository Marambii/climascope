"""AdaptionLabs 'Adaption' platform — quick-start for ClimaScope.
Two parts:
  A) Adaptive Data  -> optimize/enrich our explanation-text dataset (prompt/completion CSV).
  B) AutoScientist  -> automated training loop (stretch goal - LLM-oriented; our sklearn models
     in notebooks/03 are the production deliverables regardless).

Setup:
  1. Sign in at https://adaptionlabs.ai/app and create an API key.
  2. pip install adaption python-dotenv
  3. Put ADAPTION_API_KEY=sk-... in a .env file in the project root (see .env.example)
Docs: https://docs.adaptionlabs.ai
"""
import os
from dotenv import load_dotenv
load_dotenv()  # reads .env in project root, never commit that file

if not os.environ.get('ADAPTION_API_KEY'):
    raise RuntimeError('Set ADAPTION_API_KEY in a .env file (see .env.example) before running this script.')

import pandas as pd

# PART A: Adaptive Data (Useful for the Explain step) ----------
# Build a small prompt/completion dataset: model features -> human-readable explanation.
# After adaptation we get higher-quality, more varied explanations for the UI.
from adaption import Adaption
client = Adaption(api_key=os.environ['ADAPTION_API_KEY'])

df = pd.DataFrame({
    'prompt': [
        'Location JKUAT: 30-day rainfall z=-2.1, humidity trend=-0.8, temp z=+1.3, dry spell=18 days',
        'Location JKUAT: 30-day rainfall z=-0.4, humidity trend=-0.1, temp z=+0.2, dry spell=3 days',
        'Location JKUAT: 30-day rainfall z=-1.2, humidity trend=-0.5, temp z=+0.8, dry spell=9 days',
    ],
    'completion': [
        'WARNING: Low rainfall and declining soil moisture with above-average temperatures. Recommend inspecting water availability.',
        'NORMAL: Conditions within the seasonal fingerprint. Continue routine monitoring.',
        'WATCH: Rainfall below seasonal baseline with a developing dry spell. Monitor daily and verify rain gauges.',
    ],
})
df.to_csv('../data/explanations_seed.csv', index=False)

#The library ships a ready-made `wait_for_completion()` helper that does exactly this polling (with backoff) for you.
upload = client.datasets.upload_file('../data/explanations_seed.csv')
dataset_id = upload.dataset_id
print('Uploaded dataset:', dataset_id)

run = client.datasets.run(dataset_id, column_mapping={'prompt': 'prompt', 'completion': 'completion'})
print('Adaptive Data run started:', run.run_id)

from adaption import DatasetTimeout
try:
    status = client.datasets.wait_for_completion(dataset_id, timeout=1800.0)  # polls get_status(dataset_id) until succeeded/failed
    print('status:', status.status)
except DatasetTimeout as e:
    print(f'Still running after {e.timeout}s (last status: {e.last_status}) -- check '
          f'client.datasets.get_status("{dataset_id}") later, or re-run with a longer timeout.')
    status = None

if status is not None and status.status == 'succeeded':
    out_path = '../outputs/explanations_adapted.csv'
    client.datasets.download(dataset_id, file_format='csv').write_to_file(out_path)
    adapted = pd.read_csv(out_path)
    print(f'Adapted dataset -> outputs/explanations_adapted.csv ({len(adapted)} rows)')
elif status is not None and status.status == 'failed':
    print('Run failed:', status.error_data)

# PART B: AutoScientist (optional stretch goal, timebox to ~2 hours)
# Flow per docs: create job -> platform searches training recipes -> download best checkpoint.
# NOTE: AutoScientist targets LLM fine-tuning (prompt/completion data + win-rate target).
# from adaption import AutoScientist
# job = client.autoscientist.create(
#     dataset_id=dataset_id,
#     target_description='explanations that agronomists rate as clear and actionable',
#     target_win_rate=0.8,
# )
# Poll job status; download best checkpoint when status == 'succeeded'.
