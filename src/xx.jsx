function useYjsStore({ role, roomId = 'myroom/', hostUrl }) {
    // Create the store as usual
    const [store] = useState(() => createTLStore({ shapeUtils: [...defaultShapeUtils] }));

    // Set up Yjs synchronization (yDoc, yStore)
    const { yDoc, yStore, room } = useMemo(() => {
        const yDoc = new Y.Doc();
        const yArr = yDoc.getArray(`tl_${roomId}`);
        const yStore = new YKeyValue(yArr);
        return {
            yDoc,
            yStore,
            room: new WebsocketProvider(hostUrl, roomId, yDoc, { connect: true }),
        };
    }, [hostUrl, roomId]);

    useEffect(() => {
        if (role === 'teacher') {
            // Teacher: Allow syncing between store and Yjs
            store.listen(({ changes }) => {
                yDoc.transact(() => {
                    // Sync changes to Yjs
                    Object.values(changes.added).forEach(record => yStore.set(record.id, record));
                    Object.values(changes.updated).forEach(([_, record]) => yStore.set(record.id, record));
                    Object.values(changes.removed).forEach(record => yStore.delete(record.id));
                });
            });
        } else {
            // Student: Only receive changes
            yStore.on('change', (changes, transaction) => {
                if (!transaction.local) {
                    const toPut = [];
                    changes.forEach(change => {
                        if (change.action === 'add' || change.action === 'update') {
                            toPut.push(yStore.get(change.newValue.id));
                        }
                    });
                    store.mergeRemoteChanges(() => {
                        if (toPut.length) store.put(toPut);
                    });
                }
            });
        }

        return () => {
            // Clean up listeners when component unmounts
            if (role === 'teacher') {
                store.listen = () => {};  // Teacher syncs are stopped
            }
        };
    }, [store, yDoc, yStore, role]);

    return store;
}
