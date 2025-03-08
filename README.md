# Booking Bot

This is a Node.js script designed to automate the booking of courts on the specified website. The script uses environment variables and command-line arguments to configure the booking process.

## Prerequisites

- Node.js installed on your machine.
- An active session ID for the booking website.

## Installation

1. Clone the repository to your local machine.
2. Navigate to the project directory.
3. Install the required dependencies by running:

   ```bash
   npm install
   ```

## Usage

To run the script, use the following command:

```bash
node bot.js --token=<SESSION_ID> --time=<START_TIME> --hours=<DURATION> [--instant]
```

### Command-line Arguments

- `--token`: The session ID for the booking website. This is required for authentication.
- `--time`: The starting hour for the booking (24-hour format). For example, `16` for 4 PM.
- `--hours`: The duration of the booking in hours. For example, `2` for a 2-hour booking.
- `--instant`: (Optional) If provided, the script will attempt to book immediately without waiting for the specified time.

### Example

To book a court starting at 4 PM for 2 hours, use:

```bash
node bot.js --token=YOUR_SESSION_ID --time=16 --hours=2
```

To book immediately, use:

```bash
node bot.js --token=YOUR_SESSION_ID --time=16 --hours=2 --instant
```

## How It Works

1. **Session ID**: The script requires a session ID to authenticate with the booking website. This is passed as a command-line argument.
2. **Booking Date**: The script automatically sets the booking date to 7 days from the current date.
3. **Booking Process**: The script attempts to book a court at the specified time and duration. If the booking fails, it will attempt to cancel any existing bookings and try again with the next available court.
4. **Logging**: The script logs the booking process, including success and failure messages, to the console.

## Dependencies

- `axios`: For making HTTP requests.
- `cheerio`: For parsing HTML and extracting data.

## License

This project is licensed under the MIT License.

