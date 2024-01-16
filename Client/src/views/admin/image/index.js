import { Box, Button, Flex, Grid, GridItem, Image } from '@chakra-ui/react'
import Card from 'components/card/Card'
import React, { useEffect, useState } from 'react'
import { fetchImage } from "../../../redux/imageSlice";
import { useDispatch, useSelector } from 'react-redux'
import ImageView from './imageView';
import AddImage from './addImage';
import { getApi } from 'services/api';

const ChangeImage = () => {
    const [imageModal, setImageModal] = useState(false)
    const dispatch = useDispatch();
    const [imageview, setImageView] = useState(false)

    useEffect(() => {
        dispatch(fetchImage());
    }, [dispatch]);

    const fetchData = async (selectedId) => {
        setIsLoding(true)
        let result = await getApi(`api/images/view/${selectedId}`);
        setData(result.data)
        setIsLoding(false)
    }
    const image = useSelector((state) => state?.images?.image);
    const handleViewOpen = (item) => {
        fetchData(item._id)
        setImageView(!imageview)
    }
    const handleViewClose = () => {
        setImageView(false)
    }

    return (
        <>
            <Card>
                <Flex justifyContent={'end'}>
                    <Button variant='brand' size='sm' onClick={() => setImageModal(true)}>New Image</Button>
                </Flex>
                <Card>
                    <Grid templateColumns={'repeat(12, 1fr)'} gap={5}>
                        {image?.length > 0 && image?.map((item, i) => (
                            <GridItem colSpan={{ base: 12, md: 4, lg: 3 }}>
                                <div className="imageCard">
                                    <Image src={item?.authImg} height={"200px"} width={"400px"} />
                                    <div className='imageContent'>
                                        <Button size='sm' variant="brand">Set Image</Button>
                                        <Button size='sm' variant="brand" ms={1} onClick={() => handleViewOpen(item)}>View</Button>
                                    </div>
                                </div>
                            </GridItem>
                        ))}
                    </Grid>
                </Card>
            </Card>

            <ImageView isOpen={imageview}
                onClose={handleViewClose}
                image={image}
                // fetchData={fetchData}
                data={data}
            />
            <AddImage imageModal={imageModal} setImageModal={setImageModal} fetchData={fetchImage} />
        </>
    )
}

export default ChangeImage