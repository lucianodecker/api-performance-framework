export interface BookingData {
    firstname: string;
    lastname: string;
    totalprice: number;
    depositpaid: boolean;
    bookingdates: {
        checkin: string;
        checkout: string;
    };
    additionalneeds: string;
}

export function createBookingData(overrides: Partial<BookingData> = {}): BookingData {
    return {
        firstname: "Default",
        lastname: "User",
        totalprice: 100,
        depositpaid: true,
        bookingdates: {
            checkin: "2026-01-01",
            checkout: "2026-02-02"
        },
        additionalneeds: "None",
        ...overrides
    };
}