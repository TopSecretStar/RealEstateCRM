import React from 'react'
import { Grid, GridItem, Box, Heading, Text } from '@chakra-ui/react'
import Card from 'components/card/Card'
import moment from 'moment'
import { HSeparator } from "components/separator/Separator";

const CustomView = ({ data, toCamelCase, fieldData }) => {

    const headingLength = data?.headings?.length % 3
    const lastLength = data?.headings.length - headingLength

    // Define a function to determine the colSpan value
    const getColSpanLg = (ind, lastLength, headingLength) => {
        if (ind < lastLength) {
            return (ind + 1) > lastLength ? 6 : 4;
        } else {
            return headingLength === 1 ? 12 : ((ind + 1) > lastLength ? 6 : 4);
        }
    };
    return (
        <Grid templateColumns="repeat(12, 1fr)" gap={3}>
            {data?.headings?.length > 0 ? <>
                {data?.headings?.map((item, ind) => (
                    <>
                        <GridItem colSpan={{
                            base: 12, md: 6, lg: getColSpanLg(ind, lastLength, headingLength)
                        }}>
                            <Card>
                                <Grid templateColumns="repeat(12, 1fr)" gap={3}>
                                    <GridItem colSpan={12}>
                                        <Heading as="h1" size="md" mb='10px'>
                                            {ind + 1}. {item?.heading}
                                        </Heading>
                                        <HSeparator />
                                    </GridItem>
                                    {
                                        data?.fields?.filter((itm) => itm?.belongsTo === item?._id)?.map((field) => (
                                            <GridItem colSpan={{ base: 12, md: 6 }} >

                                                <Text color={'blackAlpha.900'} fontSize="sm" fontWeight="bold"> {field.label}</Text>
                                                <Text color={'blackAlpha.900'} fontSize="sm" > {fieldData[field.name] || "N/A"}</Text>

                                            </GridItem>
                                        ))
                                    }
                                </Grid>
                            </Card>
                        </GridItem>
                    </>)
                )}
            </> : ''
            }
        </Grid>
    )
}

export default CustomView
