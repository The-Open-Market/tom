
async function assertThrows(promise) {
    try {
        await promise;
        assert(true);
    } catch (_) {
        return;
    }
    assert(false);
}

module.exports = {
    assertThrows,
};
