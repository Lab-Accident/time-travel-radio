from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
from pydub import AudioSegment
from io import BytesIO
import shutil
import os
import json
import math

app = Flask(__name__)
cors = CORS(app, origins='http://localhost:5173')

SEGMENTS_DIR = 'segments'
RECORDINGS_DIR = 'recordings'
STATIONS_DIR = 'stations'

OVERLAP = 10
DEF_INTERVAL = 600

@app.route('/<path:path>')
def serve_app(path):
    return send_file('../client/dist/index.html')


@app.route('/assets/<path:path>')
def serve_asssets(path):
    return send_from_directory('../client/dist/assets', path)


@app.route("/api/users", methods=['GET'])
def get_users():
    return jsonify(
        {
            "users": [
                'Radio1',
                'Radio2',
                'Radio3',
                'Radio4'
            ]
        }
    )

@app.route("/api/upload_audio", methods=['POST'])
def upload_audio():
    index = int(request.form.get('index', 0))
    audio = request.files.get('recording')
    if audio:
        try:
            audio_segment = AudioSegment.from_file(BytesIO(audio.read()))
            audio_path = f'{RECORDINGS_DIR}/recording{index + 1}.wav'
            
            audio_segment.export(audio_path, format='wav')
            print(f"Audio saved to {audio_path}")

            process_recording(audio_segment, f'recording{index + 1}')

            return jsonify({'message': 'Audio uploaded successfully'}), 200
        except Exception as e:
            return jsonify({'message': str(e)}), 500
    return jsonify({'message': 'No audio file uploaded'}), 400


@app.route("/api/stations/<number>", methods=['GET'])
def serve_station(number):
    station_audio = assemble_station(number)
    station_audio.export(f'{STATIONS_DIR}/station{number}.wav', format='wav')
    return send_file(f'{STATIONS_DIR}/station{number}.wav', mimetype='audio/wav')

def split_audio(audio, n, interval = DEF_INTERVAL):
    duration = len(audio)
    segments = math.ceil(duration / interval)

    # List of n audio segment will be split into
    split_tracks = [AudioSegment.silent(duration=0) for _ in range(n)]
    curr_track = 0

    for i in range(0, segments*interval, interval):
        for t in range(n):
            # add audio from segment to curr track
            if t == curr_track:
                start = i - OVERLAP if i - OVERLAP >= 0 else i
                end = i + interval + OVERLAP if i + interval + OVERLAP <= 60000 else i + interval
                print(f"Start: {start}, End: {end}, curr_track: {curr_track}")
                split_tracks[t] += audio[start:end]

            # add silence to other tracks
            else:
                split_tracks[t] += AudioSegment.silent(duration=interval)

        # switch to next track
        curr_track = (curr_track + 1) % n
    
    return split_tracks

def process_recording(audio, recording_name):
    with open('map.json', 'r') as file:
        map_data = json.load(file)
    
    recording_plan = map_data[recording_name]['segments']
    for segment in recording_plan:
        start = segment['start'] * 1000  
        end = segment['end'] * 1000
        stations = segment['stations']
        print(f"Processing segment {start} - {end} with stations {stations}")

        audio_segment = audio[start:end]
        split_segment = split_audio(audio_segment, len(stations))

        for i, station in enumerate(stations):
            output_path = f'{SEGMENTS_DIR}/station{station}_{segment["start"]}_{segment["end"]}.wav'
            split_segment[i].export(output_path, format='wav')
            print(f"Audio segment saved to {output_path}")


def assemble_station(station):
    station_files = [f for f in os.listdir(SEGMENTS_DIR) if f.startswith(f'station{station}_') and f.endswith('.wav')]
    station_files.sort()
    print(station_files)
    station_audio = AudioSegment.silent(duration=60000)
    for file in station_files:
        start = int(file.split('_')[1]) - OVERLAP
        start = (start * 1000) - OVERLAP if start >= 0 else 0
        audio = AudioSegment.from_file(f'{SEGMENTS_DIR}/{file}')
        print(f"Overlaying {file} at {start}")
        station_audio = station_audio.overlay(audio, position=start)
    
    
    return station_audio

def reset_directory(directory):
    if os.path.exists(directory):
        shutil.rmtree(directory)
    os.makedirs(directory)

if __name__ == '__main__':
    reset_directory(SEGMENTS_DIR)
    reset_directory(RECORDINGS_DIR)
    reset_directory(STATIONS_DIR)

    app.run(debug=True, port=8080)