import { Icon, SimpleGrid, useColorModeValue } from '@chakra-ui/react'
import MiniStatistics from "components/card/MiniStatistics";
import { HiUsers } from "react-icons/hi";
import { FaCreativeCommonsBy } from "react-icons/fa";

import IconBox from 'components/icons/IconBox';
import React from 'react'

import { useNavigate } from 'react-router-dom';

const Index = () => {
    const navigate = useNavigate();
    const brandColor = useColorModeValue("brand.500", "white");
    const boxBg = useColorModeValue("secondaryGray.300", "whiteAlpha.100");

    return (
        <div>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap="20px" mb="20px">
                <MiniStatistics
                    fontsize="md"
                    onClick={() => navigate("/user")}
                    startContent={
                        <IconBox
                            w="56px"
                            h="56px"
                            bg="linear-gradient(90deg, #4481EB 0%, #04BEFE 100%)"
                            icon={<Icon w="28px" h="28px" as={HiUsers} color="white" />}
                        />
                    }
                    name="User"
                // value={task?.length || 0}
                />
                <MiniStatistics
                    fontsize="md"
                    onClick={() => navigate("/role")}
                    startContent={
                        <IconBox
                            w="56px"
                            h="56px"
                            bg="linear-gradient(90deg, #4481EB 0%, #04BEFE 100%)"
                            icon={<Icon w="28px" h="28px" as={FaCreativeCommonsBy} color="white" />}
                        />

                    }
                    name="Role"
                // value={contactData?.length || 0}
                />
            </SimpleGrid>
        </div>
    )
}

export default Index
