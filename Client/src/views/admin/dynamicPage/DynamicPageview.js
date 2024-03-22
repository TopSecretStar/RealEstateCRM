import { AddIcon, ChevronDownIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import {
    Box, Button, Flex, Grid, GridItem, Heading, Menu, MenuButton, MenuDivider, MenuItem, MenuList,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
    VStack,
    useColorModeValue,
    useDisclosure,
} from "@chakra-ui/react";
import FolderTreeView from 'components/FolderTreeView/folderTreeView';
import Card from "components/card/Card";
import { HSeparator } from "components/separator/Separator";
import Spinner from "components/spinner/Spinner";
import { constant } from "constant";
import moment from "moment/moment";
import { useEffect, useState } from "react";
import { BsFillSendFill, BsFillTelephoneFill } from "react-icons/bs";
import { IoIosArrowBack } from "react-icons/io";
import { SiGooglemeet } from "react-icons/si";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getApi } from "services/api";
import ColumnsTable from "../contact/components/ColumnsTable";
import TaskColumnsTable from "../task/components/ColumnsTable";
import MeetingColumnsTable from "../meeting/components/ColumnsTable";
import PhoneCall from "../contact/components/phonCall";
import AddEmailHistory from "../emailHistory/components/AddEmail";
import AddMeeting from "../meeting/components/Addmeeting";
import MeetingTable from "../meeting/components/CheckTable";
import AddPhoneCall from "../phoneCall/components/AddPhoneCall";
import TaskTable from "../task/components/CheckTable.js";
import AddTask from "../task/components/addTask";
import { fetchRoles } from "../../../redux/roleSlice";
import { useDispatch, useSelector } from "react-redux";
import { HasAccess } from "../../../redux/accessUtils";
import DataNotFound from "components/notFoundData";
import CustomView from "utils/customView";
import AddDocumentModal from "utils/addDocumentModal";
import { useLocation } from 'react-router-dom';

const View = () => {

    const param = useParams()

    const user = JSON.parse(localStorage.getItem("user"));

    const buttonbg = useColorModeValue("gray.200", "white");
    const textColor = useColorModeValue("gray.500", "white");

    const [data, setData] = useState()
    const [allData, setAllData] = useState([])
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [edit, setEdit] = useState(false);
    const [deleteModel, setDelete] = useState(false);
    const [isLoding, setIsLoding] = useState(false)
    const [taskModel, setTaskModel] = useState(false);
    const [addMeeting, setMeeting] = useState(false);
    const [showEmail, setShowEmail] = useState(false);
    const [showCall, setShowCall] = useState(false);
    const [showTasks, setShowTasks] = useState(false);
    const [showMeetings, setShowMeetings] = useState(false);
    const [addDocument, setAddDocument] = useState(false);
    const [action, setAction] = useState(false)
    const [leadData, setLeadData] = useState([])
    const location = useLocation()
    const size = "lg";

    const [addEmailHistory, setAddEmailHistory] = useState(false);
    const [addPhoneCall, setAddPhoneCall] = useState(false);

    const [permission, taskPermission, meetingPermission, callAccess, emailAccess, taskAccess, meetingAccess] = HasAccess(['Leads', 'Tasks', 'Meetings', 'Calls', 'Emails', 'Tasks', 'Meetings']);

    const columnsDataColumns = [
        { Header: "sender", accessor: "senderName", },
        { Header: "recipient", accessor: "createByName", },
        { Header: "time stamp", accessor: "timestamp", },
        { Header: "Created", accessor: "createBy", },
    ];

    const textColumnsDataColumns = [
        { Header: "sender", accessor: "senderName", },
        { Header: "recipient", accessor: "to", },
        { Header: "time stamp", accessor: "timestamp", },
        { Header: "Created", accessor: "createBy", },
    ];

    const MeetingColumns = [
        { Header: 'agenda', accessor: 'agenda' },
        { Header: "date Time", accessor: "dateTime", },
        { Header: "times tamp", accessor: "timestamp", },
        { Header: "create By", accessor: "createdByName", },
    ];
    const taskColumns = [
        { Header: 'Title', accessor: 'title' },
        { Header: "Category", accessor: "category", },
        { Header: "Assign To", accessor: "assignmentToName", },
        { Header: "Start Date", accessor: "start", },
        { Header: "End Date", accessor: "end", },
    ];

    const download = async (data) => {
        if (data) {
            let result = await getApi(`api/document/download/`, data)
            if (result && result.status === 200) {
                window.open(`${constant.baseUrl}api/document/download/${data}`)
                toast.success('file Download successful')
            } else if (result && result.response.status === 404) {
                toast.error('file Not Found')
            }
        }
    }

    const fetchData = async () => {
        setIsLoding(true)
        let response = await getApi('api/lead/view/', param.id)
        setData(response.data?.lead);
        setAllData(response.data);
        setIsLoding(false)
    }

    useEffect(() => {
        fetchData()
    }, [action])
    // }, [edit, addEmailHistory, addPhoneCall])

    function toCamelCase(text) {
        return text?.replace(/([a-z])([A-Z])/g, '$1 $2');
    }

    const fetchCustomData = async () => {
        const response = await getApi('api/custom-field?moduleName=Leads')
        setLeadData(response.data)
    }

    useEffect(() => {
        if (fetchCustomData) fetchCustomData()
    }, [action])

    return (
        <>
            {/* {isOpen && <Add isOpen={isOpen} size={size} onClose={onClose} setLeadData={setLeadData} leadData={leadData[0]} setAction={setAction} />}
            <Edit isOpen={edit} size={size} onClose={setEdit} setLeadData={setLeadData} leadData={leadData[0]} setAction={setAction} moduleId={leadData?.[0]?._id} />
            <Delete isOpen={deleteModel} onClose={setDelete} method='one' url='api/lead/delete/' id={param.id} setAction={setAction} /> */}

            {isLoding ?
                <Flex justifyContent={'center'} alignItems={'center'} width="100%" >
                    <Spinner />
                </Flex> :
                <>
                    <GridItem colSpan={{ base: 12, md: 6 }} mt={{ sm: "3px", md: "5px" }} >
                        <Flex justifyContent={"right"}>
                            <Menu>
                                <MenuButton size="sm" variant="outline" colorScheme='blackAlpha' mr={2.5} as={Button} rightIcon={<ChevronDownIcon />}>
                                    Actions
                                </MenuButton>
                                <MenuDivider />
                                <MenuList minWidth={2}>
                                    <MenuItem color={'blue'} onClick={() => onOpen()} alignItems={"start"} icon={<AddIcon />}>Add</MenuItem>
                                    <MenuItem onClick={() => setEdit(true)} alignItems={"start"} icon={<EditIcon />}>Edit</MenuItem>
                                    <>
                                        <MenuDivider />
                                        <MenuItem alignItems={"start"} color={'red'} onClick={() => setDelete(true)} icon={<DeleteIcon />}>Delete</MenuItem>
                                    </>
                                </MenuList>
                            </Menu>
                            <Link to="/lead">
                                <Button leftIcon={<IoIosArrowBack />} size='sm' variant="brand">
                                    Back
                                </Button>
                            </Link>
                        </Flex>
                    </GridItem>
                    <Box style={{ margin: "10px 0" }}>
                        <CustomView data={leadData[0]} fieldData={data} />
                    </Box>
                    <Card mt={3}>
                        <Grid templateColumns="repeat(6, 1fr)" gap={1}>
                            <GridItem colStart={6} >
                                <Flex justifyContent={"right"}>
                                    <Button size='sm' onClick={() => setEdit(true)} leftIcon={<EditIcon />} mr={2.5} variant="outline" colorScheme="green">Edit</Button>
                                    <Button size='sm' style={{ background: 'red.800' }} onClick={() => setDelete(true)} leftIcon={<DeleteIcon />} colorScheme="red" >Delete</Button>
                                </Flex>
                            </GridItem>
                        </Grid>
                    </Card>

                </>
            }
        </>
    );
};

export default View;
