import connectToMongoDbDev from "@/lib/mongodb/client";

async function doTransaction<T>(callback: (session: any) => Promise<T>): Promise<T> {
    const conn = connectToMongoDbDev();
    const session = await conn.startSession();
    session.startTransaction();
    try {
        const result = await callback(session);
        await session.commitTransaction();
        return result;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
}

export default doTransaction;

