export function validateInputData(roomPrompt: string) {
    // Check that the prompt is less than 1000 characters
    if (roomPrompt.length < 1 || roomPrompt.length > 300) {
        throw new Error('Room prompt must be between 1 and 300 characters.');
    }
}