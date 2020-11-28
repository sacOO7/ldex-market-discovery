import { spawn, Pool, Worker, BlobWorker } from "threads"

describe("Parallel Processing",() => {
    jest.setTimeout(60000);
    it ("Should process iterable parallely", async () => {

        const pool = Pool(() => spawn(new Worker("./testworker.js")), 10 /* optional size */)

        for (const i of [...Array(10).keys()]) {
            pool.queue(async hashPassword => {
                return  await hashPassword("password", i)
            });
        }

        await pool.completed()
        await pool.terminate()
    })
});
