export function validateInputData(roomName: string, roomPrompt: string) {
    if (roomName.length > 50) {
        throw new Error('Room name must be between 0 and 50 characters.');
    } 

    // Check that the prompt is less than 1000 characters
    if (roomPrompt.length < 1 || roomPrompt.length >= 300) {
        throw new Error('Room prompt must be between 1 and 300 characters.');
    }
}