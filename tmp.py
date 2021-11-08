import asyncio
import websockets
import time

async def handle_websocket(websocket, path):
    print(path)
    async for message in websocket:
        f = open('duration.txt', 'r')
        for i in f:
            await websocket.send(message)
            await websocket.send("StartRec")
            time.sleep(int(i))
            await websocket.send("StopRec")
            

async def main():
    async with websockets.serve(handle_websocket, port=3000): #"127.0.0.1", 3000):
        await asyncio.Future()  # run forever

asyncio.run(main())
