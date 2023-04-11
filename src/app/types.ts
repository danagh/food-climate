export type ClimateData = {
    food: string,
    origin: string,
    climateFootprint: number,
    extraClimateFootprint?: number,
    info: string
};

export type ClimateDataWrapper = {
    data: ClimateData[]
};