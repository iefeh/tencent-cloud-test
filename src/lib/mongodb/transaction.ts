import connectToMongoDbDev from "@/lib/mongodb/client";

async function doTransaction<T>(callback: (session: any) => Promise<T>, maxRetryTimes: number = 0): Promise<T> {
    let retry = 0;
    const conn = connectToMongoDbDev();
    while (true) {
        const session = await conn.startSession();
        session.startTransaction();
        try {
            const result = await callback(session);
            await session.commitTransaction();
            return result;
        } catch (error) {
            await session.abortTransaction();
            // Can retry commit
            if (isMongoDbTransactionError(error) && retry < maxRetryTimes) {
                retry += 1;
                console.log(error);
                continue;
            } else {
                throw error;
            }
        } finally {
            session.endSession();
        }
    }
}

function isMongoDbTransactionError(error: any): boolean {
    return error.hasErrorLabel("TransientTransactionError") || error.hasErrorLabel("UnknownTransactionCommitResult");
}

export default doTransaction;

